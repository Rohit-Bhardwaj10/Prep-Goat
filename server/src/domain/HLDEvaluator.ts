import { Evaluator } from './Evaluator';
import { Problem, EvaluationResult, StageType } from './types';
import { Stage } from './Stage';
import Groq from 'groq-sdk';

export class HLDEvaluationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HLDEvaluationParseError';
  }
}

/**
 * Extracts human-readable text from a tldraw TLStore JSON snapshot.
 *
 * A tldraw snapshot looks like:
 *   { "store": { "<id>": { "type": "geo" | "text" | "arrow" | ..., "props": { "text": "..." } }, ... } }
 *
 * We pull all non-empty text strings out of shape props so the LLM can read
 * what the learner wrote on the canvas.
 */
function extractTextFromSnapshot(snapshotJson: string): string {
  if (!snapshotJson || snapshotJson.trim() === '') return '[empty canvas]';

  try {
    const snapshot = JSON.parse(snapshotJson);
    // tldraw v2 snapshot format: { store: Record<string, TLRecord> }
    const store: Record<string, any> = snapshot?.store ?? snapshot ?? {};

    const texts: string[] = [];

    for (const record of Object.values(store)) {
      if (!record || typeof record !== 'object') continue;
      // Only process shape records
      if (record.typeName !== 'shape') continue;

      const props = record.props ?? {};

      // text / note / geo shapes all put text in props.text
      if (typeof props.text === 'string' && props.text.trim()) {
        texts.push(props.text.trim());
      }
      // richText for newer versions
      if (props.richText && typeof props.richText === 'object') {
        try {
          const rt = JSON.stringify(props.richText);
          // crude extraction — grab all string values
          const matches = rt.match(/"text":"([^"]+)"/g) ?? [];
          for (const m of matches) {
            const val = m.replace(/"text":"/, '').replace(/"$/, '');
            if (val.trim()) texts.push(val.trim());
          }
        } catch { /* ignore */ }
      }

      // Arrow labels
      if (typeof props.label === 'string' && props.label.trim()) {
        texts.push(props.label.trim());
      }

      // Include shape type as structural context
      if (typeof record.type === 'string' && texts.length > 0) {
        // only annotate the last added text
        const last = texts[texts.length - 1];
        texts[texts.length - 1] = `[${record.type}] ${last}`;
      }
    }

    if (texts.length === 0) return '[canvas has shapes but no visible text labels]';
    return texts.join('\n');
  } catch {
    // If parsing fails, return a marker so the evaluator still runs
    return '[could not parse canvas snapshot]';
  }
}

export class HLDEvaluator implements Evaluator {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  async evaluate(stages: Stage[], problem: Problem): Promise<EvaluationResult[]> {
    const prompt = this.buildPrompt(stages, problem);

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a senior systems architect evaluating High-Level Design (HLD) submissions. ' +
            'The learner drew their architecture on a canvas; you will receive extracted text labels from that diagram. ' +
            'Return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new HLDEvaluationParseError('No response content from LLM');
    }

    return this.parseResponse(responseContent);
  }

  private buildPrompt(stages: Stage[], problem: Problem): string {
    const requirements = stages.find(s => s.stageType === StageType.REQUIREMENTS)?.content || '';
    const designSnapshot = stages.find(s => s.stageType === StageType.DESIGN)?.content || '';
    const extension = stages.find(s => s.stageType === StageType.EXTENSION)?.content || '';

    // Extract readable text from the tldraw canvas snapshot
    const diagramText = extractTextFromSnapshot(designSnapshot);

    return `
      Evaluate the following High-Level Design (HLD) submission.

      Problem Title: ${problem.title}
      Problem Description: ${problem.description}
      Problem Requirements: ${JSON.stringify(problem.requirements)}
      Problem Constraints: ${JSON.stringify(problem.constraints)}
      Scalability Scenarios to Handle: ${JSON.stringify(problem.testCases || [])}
      Extension Scenarios: ${JSON.stringify(problem.extensibilityHooks || [])}

      ---- LEARNER SUBMISSION ----

      [REQUIREMENTS & SCALE TARGETS]
      ${requirements || '(not provided)'}

      [ARCHITECTURE DIAGRAM — text labels extracted from canvas]
      ${diagramText}

      [SCALE & TRADE-OFFS ANALYSIS]
      ${extension || '(not provided)'}

      ---- EVALUATION INSTRUCTIONS ----

      Evaluate each stage using standard HLD criteria:
      - REQUIREMENTS stage: Scope clarity, scale assumptions, functional vs non-functional split, completeness
      - DESIGN stage: Component identification, communication patterns (sync/async), storage choices, separation of concerns, diagram clarity
      - EXTENSION stage: Bottleneck identification, caching/sharding strategy, consistency trade-offs, fault tolerance, CAP theorem awareness

      Respond with a JSON object strictly matching this schema:
      {
        "results": [
          {
            "stageType": "REQUIREMENTS" | "DESIGN" | "EXTENSION",
            "feedback": [
              {
                "criterion": "string (e.g., Scale Assumption Clarity, Storage Choice Justification)",
                "score": number (1 to 5),
                "evidence": "string (quote or description of what the learner wrote/drew)",
                "concern": "string (what is missing or incorrect)",
                "suggestion": "string (how to improve)"
              }
            ]
          }
        ]
      }
    `;
  }

  private parseResponse(content: string): EvaluationResult[] {
    try {
      const parsed = JSON.parse(content);
      if (!parsed || !Array.isArray(parsed.results)) {
        throw new Error('Missing or invalid "results" array in JSON response');
      }
      return parsed.results as EvaluationResult[];
    } catch (error: any) {
      throw new HLDEvaluationParseError(
        `Failed to parse HLD evaluation: ${error.message}`
      );
    }
  }
}

// Export the text extractor separately so it can be unit-tested independently
export { extractTextFromSnapshot };
