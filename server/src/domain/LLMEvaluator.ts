import { Evaluator } from './Evaluator';
import { Problem, EvaluationResult, StageType, CriterionFeedback } from './types';
import { Stage } from './Stage';
import Groq from 'groq-sdk';

export class EvaluationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluationParseError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM response types
// ─────────────────────────────────────────────────────────────────────────────

interface LLDTier1Facts {
  has_classes_or_interfaces: boolean;  // Any class / interface / struct / type definitions
  has_methods: boolean;                // Any method / function signatures defined
  has_relationships: boolean;          // Inheritance, composition, dependency injection present
  handles_core_requirement: boolean;   // The core problem action (e.g., park(), shorten(), book()) is implemented
  end_to_end_callable: boolean;        // A caller can invoke a method and get a meaningful result
  tier1_issues: string[];              // Plain-English list of structural gaps
}

interface LLDTier2Facts {
  [rubricKey: string]: {
    present: boolean;
    evidence: string; // Direct quote from learner's code/text, or "not found"
  };
}

interface LLDLLMResponse {
  tier1: LLDTier1Facts;
  tier2: LLDTier2Facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default LLD rubric (used when problem has no custom rubric)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LLD_RUBRIC: Record<string, string> = {
  SINGLE_RESPONSIBILITY: 'Does each class have one clear, well-named responsibility?',
  OPEN_CLOSED:           'Are new behaviours addable via extension (interface/abstract class) without editing existing classes?',
  DEPENDENCY_INVERSION:  'Do high-level classes depend on abstractions/interfaces rather than concrete implementations?',
  EDGE_CASES_HANDLED:    'Are edge cases (null inputs, empty state, capacity limits, concurrent access) addressed?',
  TEST_CASES_COVERED:    'Does the design support or explicitly mention the given test/example scenarios?',
};

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic scoring engine
// ─────────────────────────────────────────────────────────────────────────────

function scoreLLDFromFacts(
  tier1: LLDTier1Facts,
  tier2: LLDTier2Facts,
  rubric: Record<string, string>,
  stages: Stage[],
): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  // ── REQUIREMENTS stage ──────────────────────────────────────────────────
  const reqContent = stages.find(s => s.stageType === StageType.REQUIREMENTS)?.content ?? '';
  const reqWords = reqContent.split(/\s+/).filter(Boolean).length;
  const hasAssumptions = /(assume|assumption|constraint|limit|scope|out of scope|given)/i.test(reqContent);
  const hasEdgeCases = /(edge case|null|empty|invalid|error|exception|concurrent|race)/i.test(reqContent);

  const reqFeedback: CriterionFeedback[] = [
    {
      criterion: 'Completeness',
      score: reqWords >= 60 ? 5 : reqWords >= 30 ? 3 : 1,
      evidence: `Response is approximately ${reqWords} words.`,
      concern: reqWords < 30 ? 'Requirements are too brief. You need to state what the system must do and what it must not do.' : '',
      suggestion: 'Cover: actors, core actions, constraints, and what is explicitly out of scope.',
    },
    {
      criterion: 'Assumptions & Scope',
      score: hasAssumptions ? 5 : 2,
      evidence: hasAssumptions ? 'States assumptions or scope.' : 'No explicit assumptions found.',
      concern: hasAssumptions ? '' : 'No assumptions listed. Undefined scope leads to over-engineering.',
      suggestion: 'List at least 3 explicit assumptions (e.g., single-threaded, in-memory, max capacity).',
    },
    {
      criterion: 'Edge Case Awareness',
      score: hasEdgeCases ? 5 : 2,
      evidence: hasEdgeCases ? 'Mentions edge cases or error conditions.' : 'No edge cases mentioned.',
      concern: hasEdgeCases ? '' : 'No edge cases called out in requirements.',
      suggestion: 'Enumerate failure cases: what happens when capacity is full, input is null, or a duplicate is inserted?',
    },
  ];
  results.push({ stageType: StageType.REQUIREMENTS, feedback: reqFeedback });

  // ── DESIGN stage — Tier 1 gated ─────────────────────────────────────────
  const designFeedback: CriterionFeedback[] = [];

  const tier1Checks: { key: keyof LLDTier1Facts; label: string; suggestion: string }[] = [
    {
      key: 'has_classes_or_interfaces',
      label: 'Class / Interface Definitions',
      suggestion: 'Define at least one class or interface with clear naming.',
    },
    {
      key: 'has_methods',
      label: 'Method Signatures',
      suggestion: 'Add method signatures with parameter types and return types.',
    },
    {
      key: 'has_relationships',
      label: 'Class Relationships',
      suggestion: 'Show how classes relate: inheritance ("extends"), composition ("has-a"), or dependency injection.',
    },
    {
      key: 'handles_core_requirement',
      label: 'Core Requirement Implemented',
      suggestion: 'Implement the primary action the problem asks for (e.g., park(), book(), shorten()).',
    },
    {
      key: 'end_to_end_callable',
      label: 'End-to-End Callability',
      suggestion: 'Show a complete call chain from the entry point to where data is stored or returned.',
    },
  ];

  for (const check of tier1Checks) {
    const passed = Boolean(tier1[check.key]);
    designFeedback.push({
      criterion: check.label,
      score: passed ? 5 : 1,
      evidence: passed ? 'Found in design.' : 'Not found in design.',
      concern: passed ? '' : `"${check.label}" is missing from your class design.`,
      suggestion: passed ? '' : check.suggestion,
    });
  }

  // Tier 2 — concept rubric, only scored if Tier 1 mostly passes
  const tier1PassCount = tier1Checks.filter(c => Boolean(tier1[c.key])).length;
  const tier1Passed = tier1PassCount >= 4;

  for (const [rubricKey, rubricQuestion] of Object.entries(rubric)) {
    const fact = tier2[rubricKey];
    const present = tier1Passed ? Boolean(fact?.present) : false;

    designFeedback.push({
      criterion: rubricKey.replace(/_/g, ' ').replace(/^(HAS|IS|USES)\s/i, '').trim(),
      score: present ? 5 : tier1Passed ? 2 : 1,
      evidence: fact?.evidence ?? 'Not evaluated (design structure incomplete).',
      concern: present
        ? ''
        : tier1Passed
          ? `${rubricQuestion} — not evident in your design.`
          : 'Fix the structural gaps above before design principles are evaluated.',
      suggestion: present
        ? ''
        : tier1Passed
          ? 'Refactor your design to explicitly demonstrate this principle.'
          : 'Build a structurally complete design first.',
    });
  }

  results.push({ stageType: StageType.DESIGN, feedback: designFeedback });

  // ── EXTENSION stage ─────────────────────────────────────────────────────
  const extContent = stages.find(s => s.stageType === StageType.EXTENSION)?.content ?? '';
  const extWords = extContent.split(/\s+/).filter(Boolean).length;
  const mentionsExtensibility = /(extend|extensi|plugin|hook|strategy|observer|factory|abstract|interface|polymorphi)/i.test(extContent);
  const mentionsConcurrency = /(thread|concurrent|lock|synchroni|atomic|race condition|mutex|semaphore)/i.test(extContent);
  const mentionsTradeoffs = /(trade-?off|tradeoff|advantage|disadvantage|pros|cons|vs\b|versus|instead of)/i.test(extContent);
  const mentionsTestCoverage = /(test|spec|scenario|case|cover|verify|assert|given|when|then)/i.test(extContent);

  results.push({
    stageType: StageType.EXTENSION,
    feedback: [
      {
        criterion: 'Extensibility Handling',
        score: mentionsExtensibility ? 5 : 2,
        evidence: mentionsExtensibility ? 'Mentions extension patterns or mechanisms.' : 'No extensibility discussion.',
        concern: mentionsExtensibility ? '' : 'Did not address how to extend the design for new requirements.',
        suggestion: 'Show how you would add a new feature (e.g., new payment method, new vehicle type) without modifying core classes.',
      },
      {
        criterion: 'Concurrency Awareness',
        score: mentionsConcurrency ? 5 : 2,
        evidence: mentionsConcurrency ? 'Addresses thread safety or concurrency.' : 'No concurrency discussion.',
        concern: mentionsConcurrency ? '' : 'No mention of concurrent access patterns.',
        suggestion: 'Address: what happens if two users call the same method simultaneously? How do you prevent race conditions?',
      },
      {
        criterion: 'Trade-off Reasoning',
        score: mentionsTradeoffs ? 5 : 2,
        evidence: mentionsTradeoffs ? 'Compares design choices.' : 'No trade-off discussion.',
        concern: mentionsTradeoffs ? '' : 'No trade-offs discussed for your design decisions.',
        suggestion: 'Explain why you chose your current design over an alternative (e.g., "I used composition over inheritance because...").',
      },
      {
        criterion: 'Test / Scenario Coverage',
        score: mentionsTestCoverage ? 5 : 2,
        evidence: mentionsTestCoverage ? 'Walks through test scenarios.' : 'No test scenarios mentioned.',
        concern: mentionsTestCoverage ? '' : 'Did not walk through the given test scenarios.',
        suggestion: 'Trace through each test case step by step and verify your design handles it correctly.',
      },
      {
        criterion: 'Depth & Detail',
        score: extWords >= 80 ? 5 : extWords >= 40 ? 3 : 1,
        evidence: `Response is approximately ${extWords} words.`,
        concern: extWords < 40 ? 'Extension analysis is too brief.' : '',
        suggestion: 'Cover at least 3 extension scenarios or trade-off decisions.',
      },
    ],
  });

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main evaluator class
// ─────────────────────────────────────────────────────────────────────────────

export class LLMEvaluator implements Evaluator {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  async evaluate(stages: Stage[], problem: Problem): Promise<EvaluationResult[]> {
    const designContent = stages.find(s => s.stageType === StageType.DESIGN)?.content ?? '';

    const rubric = this.extractRubric(problem);
    const prompt = this.buildPrompt(designContent, rubric, problem);

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a senior software engineer reviewing a Low-Level Design submission. ' +
            'Your ONLY job is to report what you see in the code/pseudocode as boolean facts. ' +
            'Do NOT score anything. Do NOT invent classes or methods. ' +
            'Only report what is explicitly written. Return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama3-70b-8192',
      response_format: { type: 'json_object' },
      temperature: 0.0, // Zero temperature — deterministic fact extraction
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new EvaluationParseError('No response content from LLM');
    }

    const llmResponse = this.parseLLMResponse(responseContent);
    return scoreLLDFromFacts(llmResponse.tier1, llmResponse.tier2, rubric, stages);
  }

  private extractRubric(problem: Problem): Record<string, string> {
    try {
      if (problem.extensibilityHooks && typeof problem.extensibilityHooks === 'object') {
        const hooks = problem.extensibilityHooks as any[];
        const rubricEntry = hooks.find((h: any) => typeof h === 'object' && h.RUBRIC);
        if (rubricEntry?.RUBRIC) return rubricEntry.RUBRIC;
      }
    } catch { /* ignore */ }
    return DEFAULT_LLD_RUBRIC;
  }

  private buildPrompt(
    designContent: string,
    rubric: Record<string, string>,
    problem: Problem,
  ): string {
    const rubricLines = Object.entries(rubric)
      .map(([key, question]) => `  "${key}": "${question}"`)
      .join(',\n');

    return `
You are reviewing a Low-Level Design submission for: "${problem.title}"

LEARNER'S CLASS DESIGN (code / pseudocode):
${designContent || '(empty)'}

Your task is to return a JSON object with exactly this structure:

{
  "tier1": {
    "has_classes_or_interfaces": <true if any class, interface, struct, or type is explicitly defined>,
    "has_methods": <true if any method or function signatures are defined with parameters>,
    "has_relationships": <true if inheritance (extends/implements), composition (field of another class type), or dependency injection is shown>,
    "handles_core_requirement": <true if the primary domain action for "${problem.title}" is implemented as a method>,
    "end_to_end_callable": <true if you can trace a complete call from an entry point to where data is stored/returned>,
    "tier1_issues": [<list ONLY missing structural elements, be brief and specific>]
  },
  "tier2": {
${rubricLines}
  }
}

For tier2, each entry must be:
"RUBRIC_KEY": { "present": <true/false>, "evidence": "<exact quote from learner code, or 'not found'>" }

STRICT RULES:
- Only report what is EXPLICITLY written in the design above.
- Do NOT infer intent. If a class or method is not written, it is not present.
- If the submission is pseudocode or informal, still apply the same rules literally.
- Do NOT score — only extract boolean facts.
`;
  }

  private parseLLMResponse(content: string): LLDLLMResponse {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.tier1 || !parsed.tier2) {
        throw new Error('Missing tier1 or tier2 in LLM response');
      }
      return parsed as LLDLLMResponse;
    } catch (error: any) {
      throw new EvaluationParseError(
        `Failed to parse LLD evaluation response: ${error.message}\nRaw: ${content.slice(0, 300)}`
      );
    }
  }
}

export { DEFAULT_LLD_RUBRIC, scoreLLDFromFacts };
