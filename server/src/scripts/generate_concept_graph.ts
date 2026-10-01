import { prisma } from '../auth';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: 'asc' },
    select: { tags: true, type: true }
  });

  const hld = problems.filter(p => p.type === 'HLD');
  const lld = problems.filter(p => p.type === 'LLD');

  const prereqGraph: Record<string, string[]> = {};

  function buildGraph(problemsList: { tags: any }[]) {
    let prevConcepts: string[] = [];
    for (const p of problemsList) {
      const concepts = (p.tags as string[]).slice(1);
      for (const c of concepts) {
        if (!prereqGraph[c]) {
          prereqGraph[c] = [...prevConcepts];
        }
      }
      prevConcepts = concepts;
    }
  }

  buildGraph(hld);
  buildGraph(lld);

  fs.writeFileSync(path.join(__dirname, '../data/conceptGraph.ts'), `export const CONCEPT_PREREQUISITES: Record<string, string[]> = ${JSON.stringify(prereqGraph, null, 2)};\n`);
  console.log('Done generating conceptGraph.ts');
}

generate().catch(console.error).finally(() => prisma.$disconnect());
