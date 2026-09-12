import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HLDEvaluator, HLDEvaluationParseError, extractTextFromSnapshot } from '../../src/domain/HLDEvaluator';
import { StageType, StageStatus } from '../../src/domain/types';

const mockCreate = vi.fn();

// Mock the Groq SDK
vi.mock('groq-sdk', () => {
  return {
    default: class MockGroq {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe('HLDEvaluator', () => {
  let evaluator: HLDEvaluator;

  beforeEach(() => {
    vi.clearAllMocks();
    evaluator = new HLDEvaluator('fake-api-key');
  });

  const mockProblem = {
    id: 'problem-1',
    title: 'URL Shortener',
    description: 'Design a scalable URL shortening service',
    requirements: ['Generate short alias'],
    constraints: ['Read:Write ratio ~1000:1'],
    testCases: ['Two users request same URL'],
    extensibilityHooks: ['Add analytics'],
    createdAt: new Date(),
  };

  const mockStages = [
    {
      id: 's1',
      attemptId: 'a1',
      stageType: StageType.REQUIREMENTS,
      content: 'Reqs content',
      status: StageStatus.COMPLETED,
    },
    {
      id: 's2',
      attemptId: 'a1',
      stageType: StageType.DESIGN,
      content: JSON.stringify({
        store: {
          "shape:1": { typeName: "shape", type: "geo", props: { text: "API Gateway" } },
          "shape:2": { typeName: "shape", type: "arrow", props: { label: "requests" } },
          "shape:3": { typeName: "shape", type: "geo", props: { richText: { text: "Redis" } } }
        }
      }),
      status: StageStatus.COMPLETED,
    },
    {
      id: 's3',
      attemptId: 'a1',
      stageType: StageType.EXTENSION,
      content: 'Extension content',
      status: StageStatus.COMPLETED,
    },
  ];

  describe('extractTextFromSnapshot', () => {
    it('extracts text and labels from shapes', () => {
      const snapshot = JSON.stringify({
        store: {
          "shape:1": { typeName: "shape", type: "geo", props: { text: "Web Server" } },
          "shape:2": { typeName: "shape", type: "arrow", props: { text: "", label: "HTTP" } }
        }
      });
      const text = extractTextFromSnapshot(snapshot);
      expect(text).toContain('[geo] Web Server');
      expect(text).toContain('[arrow] HTTP');
    });

    it('extracts rich text if present', () => {
      const snapshot = JSON.stringify({
        store: {
          "shape:1": { typeName: "shape", type: "geo", props: { richText: { foo: [{ text: "Database" }] } } }
        }
      });
      const text = extractTextFromSnapshot(snapshot);
      expect(text).toContain('[geo] Database');
    });

    it('returns empty marker if no texts', () => {
      const snapshot = JSON.stringify({
        store: {
          "shape:1": { typeName: "shape", type: "geo", props: { text: "" } }
        }
      });
      const text = extractTextFromSnapshot(snapshot);
      expect(text).toBe('[canvas has shapes but no visible text labels]');
    });
    
    it('returns empty marker if invalid json', () => {
      const text = extractTextFromSnapshot('{ invalid');
      expect(text).toBe('[could not parse canvas snapshot]');
    });
  });

  describe('evaluate', () => {
    it('should successfully evaluate and parse a valid JSON response from Groq', async () => {
      const fakeJsonResponse = {
        results: [
          {
            stageType: 'DESIGN',
            feedback: [
              {
                criterion: 'Component Identification',
                score: 4,
                evidence: 'Included API Gateway and Redis',
                concern: 'Missed persistent DB',
                suggestion: 'Add Postgres',
              }
            ]
          }
        ]
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(fakeJsonResponse)
            }
          }
        ]
      });

      const result = await evaluator.evaluate(mockStages as any, mockProblem);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].stageType).toBe('DESIGN');
      expect(result[0].feedback[0].score).toBe(4);
    });

    it('should throw HLDEvaluationParseError if Groq returns valid JSON but missing "results" array', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          { message: { content: JSON.stringify({ feedback: [] }) } }
        ]
      });

      await expect(evaluator.evaluate(mockStages as any, mockProblem)).rejects.toThrow(HLDEvaluationParseError);
    });
  });
});
