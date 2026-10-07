import { Evaluator } from './Evaluator';
import { Problem, EvaluationResult, StageType, CriterionFeedback } from './types';
import { Stage } from './Stage';
import Groq from 'groq-sdk';

export class HLDEvaluationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HLDEvaluationParseError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas text extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts human-readable text from a tldraw TLStore JSON snapshot.
 * Pulls all non-empty text strings out of shape props so the LLM can read
 * what the learner wrote on the canvas.
 */
function extractTextFromSnapshot(snapshotJson: string): string {
  if (!snapshotJson || snapshotJson.trim() === '') return '[empty canvas]';

  try {
    const snapshot = JSON.parse(snapshotJson);
    const store: Record<string, any> = snapshot?.store ?? snapshot ?? {};

    const texts: string[] = [];

    for (const record of Object.values(store)) {
      if (!record || typeof record !== 'object') continue;
      if (record.typeName !== 'shape') continue;

      const props = record.props ?? {};
      const shapeType: string = record.type ?? 'shape';

      if (typeof props.text === 'string' && props.text.trim()) {
        texts.push(`[${shapeType}] ${props.text.trim()}`);
      }
      if (props.richText && typeof props.richText === 'object') {
        try {
          const rt = JSON.stringify(props.richText);
          const matches = rt.match(/"text":"([^"]+)"/g) ?? [];
          for (const m of matches) {
            const val = m.replace(/"text":"/, '').replace(/"$/, '');
            if (val.trim()) texts.push(`[${shapeType}] ${val.trim()}`);
          }
        } catch { /* ignore */ }
      }
      if (typeof props.label === 'string' && props.label.trim()) {
        texts.push(`[arrow-label] ${props.label.trim()}`);
      }
    }

    if (texts.length === 0) return '[canvas has shapes but no visible text labels]';
    return texts.join('\n');
  } catch {
    return '[could not parse canvas snapshot]';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM response types (what the model is asked to return)
// ─────────────────────────────────────────────────────────────────────────────

interface Tier1Facts {
  has_client: boolean;         // Any representation of a user / client / browser / app
  has_api_layer: boolean;      // Any API server / service / backend
  has_storage: boolean;        // Any database / storage / cache
  components_connected: boolean; // Arrows/connections exist between components
  end_to_end_flow: boolean;    // Data can flow from client → API → storage
  tier1_issues: string[];      // Plain-English list of structural problems found
}

interface Tier2Facts {
  [rubricKey: string]: {
    present: boolean;
    evidence: string; // Direct quote or "not found" 
  };
}

interface LLMResponse {
  tier1: Tier1Facts;
  tier2: Tier2Facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default rubric used when no problem-specific rubric is present in tags
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_RUBRIC: Record<string, string> = {
  HAS_LOAD_BALANCER:    'Is there a Load Balancer or API Gateway in front of the backend?',
  HAS_CACHE:            'Is there a caching layer (Redis, Memcached, CDN) between API and DB?',
  HAS_ASYNC_PROCESSING: 'Is there any asynchronous processing (queue, message broker, worker)?',
  HAS_SEPARATE_STORAGE: 'Are different storage concerns separated (e.g., blob storage vs metadata DB)?',
  HAS_MONITORING:       'Is there any mention of logging, metrics, or alerting?',
};

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic scoring engine
// ─────────────────────────────────────────────────────────────────────────────

interface ScoringResult {
  results: EvaluationResult[];
  overallScore: number;
  maxScore: number;
}

function scoreFromFacts(
  tier1: Tier1Facts,
  tier2: Tier2Facts,
  rubric: Record<string, string>,
  stages: Stage[],
): ScoringResult {
  const results: EvaluationResult[] = [];

  // ── REQUIREMENTS stage ──────────────────────────────────────────────────
  const reqContent = stages.find(s => s.stageType === StageType.REQUIREMENTS)?.content ?? '';
  const reqWords = reqContent.split(/\s+/).filter(Boolean).length;
  const hasScaleNumbers = /\d+\s*(M|K|GB|TB|ms|req|RPS|QPS|users|writes|reads)/i.test(reqContent);
  const hasFunctionalVsNonFunctional = /(functional|non-functional|availability|latency|throughput|consistency)/i.test(reqContent);

  const reqFeedback: CriterionFeedback[] = [
    {
      criterion: 'Completeness',
      score: reqWords >= 80 ? 5 : reqWords >= 40 ? 3 : 1,
      evidence: `Response is approximately ${reqWords} words.`,
      concern: reqWords < 40 ? 'Requirements section is too brief. Elaborate on scope and edge cases.' : '',
      suggestion: 'Cover who uses the system, what actions they take, and what the system must guarantee.',
    },
    {
      criterion: 'Scale Assumptions',
      score: hasScaleNumbers ? 5 : 2,
      evidence: hasScaleNumbers ? 'Contains numeric scale assumptions.' : 'No numeric estimates found.',
      concern: hasScaleNumbers ? '' : 'Missing concrete numbers (e.g., 1M users/day, p99 < 100ms).',
      suggestion: 'State writes/sec, reads/sec, data size, and latency budgets explicitly.',
    },
    {
      criterion: 'Functional vs Non-Functional Split',
      score: hasFunctionalVsNonFunctional ? 4 : 2,
      evidence: hasFunctionalVsNonFunctional ? 'Mentions non-functional concerns.' : 'Only functional requirements found.',
      concern: hasFunctionalVsNonFunctional ? '' : 'No mention of availability, latency, or consistency targets.',
      suggestion: 'Add a section for non-functional requirements: availability SLA, latency budget, CAP choice.',
    },
  ];
  results.push({ stageType: StageType.REQUIREMENTS, feedback: reqFeedback });

  // ── DESIGN stage — gated by Tier 1 ─────────────────────────────────────
  const designFeedback: CriterionFeedback[] = [];

  // Tier 1: Structural gatekeeper (max 15 pts across 5 binary checks)
  const tier1Checks: { key: keyof Tier1Facts; label: string; suggestion: string }[] = [
    { key: 'has_client',         label: 'Client / User Entry Point', suggestion: 'Draw a client or user actor to show where requests originate.' },
    { key: 'has_api_layer',      label: 'API / Service Layer',        suggestion: 'Add an API server or backend service that handles requests.' },
    { key: 'has_storage',        label: 'Storage Layer',               suggestion: 'Add a database or storage component to persist data.' },
    { key: 'components_connected', label: 'Components Connected',       suggestion: 'Draw arrows between components to show data flow.' },
    { key: 'end_to_end_flow',    label: 'End-to-End Data Flow',         suggestion: 'Ensure a complete path exists: Client → API → Storage.' },
  ];

  for (const check of tier1Checks) {
    const passed = Boolean(tier1[check.key]);
    designFeedback.push({
      criterion: check.label,
      score: passed ? 5 : 1,
      evidence: passed ? 'Found in diagram.' : 'Not found in diagram.',
      concern: passed ? '' : `"${check.label}" is missing from your architecture.`,
      suggestion: passed ? '' : check.suggestion,
    });
  }

  // Tier 2: Concept-specific rubric (only meaningful if Tier 1 passes)
  const tier1PassCount = tier1Checks.filter(c => Boolean(tier1[c.key])).length;
  const tier1Passed = tier1PassCount >= 4; // Must pass at least 4/5 structural checks

  for (const [rubricKey, rubricQuestion] of Object.entries(rubric)) {
    const fact = tier2[rubricKey];
    const present = tier1Passed ? Boolean(fact?.present) : false;

    designFeedback.push({
      criterion: rubricKey.replace(/_/g, ' ').replace(/\bHAS\b/, '').trim(),
      score: present ? 5 : tier1Passed ? 2 : 1,
      evidence: fact?.evidence ?? 'Not evaluated (architecture incomplete).',
      concern: present
        ? ''
        : tier1Passed
          ? `${rubricQuestion} — not found in your diagram.`
          : 'Fix the structural issues above before advanced concepts are evaluated.',
      suggestion: present
        ? ''
        : tier1Passed
          ? `Add this concept explicitly to your architecture diagram.`
          : 'Build a complete end-to-end architecture first.',
    });
  }

  results.push({ stageType: StageType.DESIGN, feedback: designFeedback });

  // ── EXTENSION stage ─────────────────────────────────────────────────────
  const extContent = stages.find(s => s.stageType === StageType.EXTENSION)?.content ?? '';
  const extWords = extContent.split(/\s+/).filter(Boolean).length;
  const mentionsCap = /(cap theorem|consistency|availability|partition|trade-off|tradeoff)/i.test(extContent);
  const mentionsBottleneck = /(bottleneck|single point|spof|failure|latency|hot key|thundering herd|stampede)/i.test(extContent);
  const mentionsScaleSolution = /(shard|partition|replica|cache|cdn|queue|async|horizontal|vertical)/i.test(extContent);

  results.push({
    stageType: StageType.EXTENSION,
    feedback: [
      {
        criterion: 'Bottleneck Identification',
        score: mentionsBottleneck ? 5 : 2,
        evidence: mentionsBottleneck ? 'Identifies failure points or hotspots.' : 'No bottlenecks mentioned.',
        concern: mentionsBottleneck ? '' : 'Did not identify where the system would fail under load.',
        suggestion: 'Analyze each component: what breaks first at 10x traffic?',
      },
      {
        criterion: 'Scale Solutions',
        score: mentionsScaleSolution ? 5 : 2,
        evidence: mentionsScaleSolution ? 'Proposes concrete scale strategies.' : 'No scale strategies mentioned.',
        concern: mentionsScaleSolution ? '' : 'No concrete solutions proposed (sharding, caching, async, etc.).',
        suggestion: 'Suggest at least one horizontal scaling strategy per bottleneck.',
      },
      {
        criterion: 'CAP / Trade-off Reasoning',
        score: mentionsCap ? 5 : 2,
        evidence: mentionsCap ? 'Discusses consistency, availability, or partition trade-offs.' : 'No CAP/trade-off discussion found.',
        concern: mentionsCap ? '' : 'No discussion of consistency vs availability trade-offs.',
        suggestion: 'State which CAP guarantees your system prioritises and why.',
      },
      {
        criterion: 'Depth & Detail',
        score: extWords >= 100 ? 5 : extWords >= 50 ? 3 : 1,
        evidence: `Response is approximately ${extWords} words.`,
        concern: extWords < 50 ? 'Extension analysis is too brief.' : '',
        suggestion: 'Walk through at least 2–3 failure scenarios and your mitigation for each.',
      },
    ],
  });

  // ── Compute totals ───────────────────────────────────────────────────────
  let totalScore = 0;
  let maxScore = 0;
  for (const result of results) {
    for (const fb of result.feedback) {
      totalScore += fb.score;
      maxScore += 5;
    }
  }

  return { results, overallScore: totalScore, maxScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main evaluator class
// ─────────────────────────────────────────────────────────────────────────────

export class HLDEvaluator implements Evaluator {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  async evaluate(stages: Stage[], problem: Problem): Promise<EvaluationResult[]> {
    const designSnapshot = stages.find(s => s.stageType === StageType.DESIGN)?.content ?? '';
    const diagramText = extractTextFromSnapshot(designSnapshot);

    // Determine rubric (problem can supply a custom rubric via extensibilityHooks JSON)
    const rubric = this.extractRubric(problem);

    const prompt = this.buildPrompt(diagramText, rubric, problem);

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a senior systems architect reviewing an architecture diagram. ' +
            'Your ONLY job is to report what you see in the diagram as boolean facts. ' +
            'Do NOT score anything. Do NOT invent components. Only report what is explicitly visible. ' +
            'Return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama3-70b-8192',
      response_format: { type: 'json_object' },
      temperature: 0.0, // Zero temperature — we want deterministic fact extraction
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new HLDEvaluationParseError('No response content from LLM');
    }

    const llmResponse = this.parseLLMResponse(responseContent);
    const { results } = scoreFromFacts(llmResponse.tier1, llmResponse.tier2, rubric, stages);
    return results;
  }

  private extractRubric(problem: Problem): Record<string, string> {
    // If problem has a rubric embedded in extensibilityHooks as JSON, use it
    try {
      if (problem.extensibilityHooks && typeof problem.extensibilityHooks === 'object') {
        const hooks = problem.extensibilityHooks as any[];
        const rubricEntry = hooks.find((h: any) => typeof h === 'object' && h.RUBRIC);
        if (rubricEntry?.RUBRIC) return rubricEntry.RUBRIC;
      }
    } catch { /* ignore */ }

    return DEFAULT_RUBRIC;
  }

  private buildPrompt(
    diagramText: string,
    rubric: Record<string, string>,
    problem: Problem,
  ): string {
    const rubricLines = Object.entries(rubric)
      .map(([key, question]) => `  "${key}": "${question}"`)
      .join(',\n');

    return `
You are reviewing a High-Level Design diagram for: "${problem.title}"

DIAGRAM (text labels extracted from canvas):
${diagramText}

Your task is to return a JSON object with exactly this structure:

{
  "tier1": {
    "has_client": <true if any shape is labelled client / user / browser / mobile app / actor>,
    "has_api_layer": <true if any shape is labelled API / server / service / backend / gateway>,
    "has_storage": <true if any shape is labelled DB / database / storage / cache / S3 / Redis / Postgres etc.>,
    "components_connected": <true if arrow shapes exist between components (look for [arrow] shapes in the diagram)>,
    "end_to_end_flow": <true if a plausible path exists from client → API → storage>,
    "tier1_issues": [<list ONLY missing structural elements, be specific and brief>]
  },
  "tier2": {
${rubricLines}
  }
}

For tier2, each entry must be:
"RUBRIC_KEY": { "present": <true/false>, "evidence": "<exact label text from diagram, or 'not found'>" }

STRICT RULES:
- Only report what is EXPLICITLY visible as a text label in the diagram.
- If a component is only in the requirements or extension text (not the diagram), mark it as NOT present.
- Do not infer or assume. If you cannot find it, it is false.
`;
  }

  private parseLLMResponse(content: string): LLMResponse {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.tier1 || !parsed.tier2) {
        throw new Error('Missing tier1 or tier2 in response');
      }
      return parsed as LLMResponse;
    } catch (error: any) {
      throw new HLDEvaluationParseError(
        `Failed to parse HLD evaluation response: ${error.message}\nRaw: ${content.slice(0, 300)}`
      );
    }
  }
}

// Export for unit testing
export { extractTextFromSnapshot, scoreFromFacts, DEFAULT_RUBRIC };
