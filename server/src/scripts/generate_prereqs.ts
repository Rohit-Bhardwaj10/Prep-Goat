import { prisma } from '../auth';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const problems = await prisma.problem.findMany({ orderBy: { id: 'asc' } });
  
  const prereqs: Record<string, string[]> = {};
  
  // Group by type (HLD, LLD)
  const hld = problems.filter(p => p.type === 'HLD').sort((a, b) => a.id.localeCompare(b.id));
  const lld = problems.filter(p => p.type === 'LLD').sort((a, b) => a.id.localeCompare(b.id));
  
  // For each type, problem N requires concepts from problem N-1
  for (let i = 1; i < hld.length; i++) {
    const prevTags = hld[i-1].tags as string[];
    // skip the first tag which is the group
    const concepts = prevTags.slice(1);
    prereqs[hld[i].id] = concepts;
  }
  
  for (let i = 1; i < lld.length; i++) {
    const prevTags = lld[i-1].tags as string[];
    const concepts = prevTags.slice(1);
    prereqs[lld[i].id] = concepts;
  }
  
  const content = `export const PREREQUISITES: Record<string, string[]> = ${JSON.stringify(prereqs, null, 2)};`;
  fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../data/prerequisites.ts'), content);
  console.log('Generated src/data/prerequisites.ts');
}
run().catch(console.error);
