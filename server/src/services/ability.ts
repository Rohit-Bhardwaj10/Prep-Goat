import { prisma } from '../auth';
import { CONCEPT_PREREQUISITES } from '../data/conceptGraph';

export interface AbilityEvidence {
  attemptId: string;
  problemId: string;
  score: number;
  date: Date;
  gradedBy: 'simulator' | 'model';
}

export interface ConceptAbility {
  score: number;
  confidence: number;
  evidence: AbilityEvidence[];
  isSolid: boolean;
}

export interface UserAbilityMap {
  concepts: Record<string, ConceptAbility>;
  unlockedProblems: string[];
}

export async function computeAbility(userId: string): Promise<UserAbilityMap> {
  // Fetch all completed attempts and their evaluations for the user
  const attempts = await prisma.attempt.findMany({
    where: { learnerId: userId, status: 'COMPLETED' },
    include: {
      evaluation: true
      ,
      problem: {
        select: { tags: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const conceptData: Record<string, AbilityEvidence[]> = {};

  // Parse evidence from evaluations
  for (const attempt of attempts) {
    if (!attempt.evaluation || !attempt.evaluation.results) continue;
    
    // Fallback parsing (assuming results is an object with conceptScores)
    const results = attempt.evaluation.results as any;
    const conceptScores = results.conceptScores || {};
    
    // Alternatively, if evaluation applies to all concepts in the problem:
    const problemConcepts = (attempt.problem.tags as string[]).slice(1);
    
    for (const concept of problemConcepts) {
      if (!conceptData[concept]) conceptData[concept] = [];
      
      const score = conceptScores[concept] || results.overallScore || 0;
      conceptData[concept].push({
        attemptId: attempt.id,
        problemId: attempt.problemId,
        score,
        date: attempt.evaluation.createdAt,
        gradedBy: results.gradedBy || 'model'
      });
    }
  }

  const abilityMap: Record<string, ConceptAbility> = {};

  // Calculate score, confidence, and isSolid per concept
  for (const [concept, evidenceList] of Object.entries(conceptData)) {
    // Sort oldest to newest for chronological processing
    const sortedEvidence = [...evidenceList].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let totalWeight = 0;
    let weightedScoreSum = 0;
    
    const uniqueProblems = new Set<string>();

    for (let i = 0; i < sortedEvidence.length; i++) {
      const ev = sortedEvidence[i];
      uniqueProblems.add(ev.problemId);
      
      // Recency weighting: newer attempts count more
      // Simple index-based weight (e.g. 1.0, 1.2, 1.44...)
      let weight = Math.pow(1.2, i);
      
      // Weight simulator higher than model
      if (ev.gradedBy === 'simulator') weight *= 1.5;
      
      weightedScoreSum += ev.score * weight;
      totalWeight += weight;
    }

    const finalScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;
    
    // Confidence based on number of attempts and unique problems
    const confidence = Math.min(100, (sortedEvidence.length * 20) + (uniqueProblems.size * 30));

    // Define "solid" explicitly: score >= 80, confidence >= 70
    // For MVP, we relax "solid" to just score >= 70
    const isSolid = finalScore >= 70;

    abilityMap[concept] = {
      score: Math.round(finalScore),
      confidence,
      evidence: sortedEvidence,
      isSolid
    };
  }

  // Determine unlocked problems
  const unlockedProblems: string[] = [];
  const allProblems = await prisma.problem.findMany({ select: { id: true, tags: true }});
  
  for (const p of allProblems) {
    const concepts = (p.tags as string[]).slice(1);
    
    let canUnlock = true;
    for (const c of concepts) {
      const prerequisites = CONCEPT_PREREQUISITES[c] || [];
      for (const req of prerequisites) {
        if (!abilityMap[req] || !abilityMap[req].isSolid) {
          canUnlock = false;
          break;
        }
      }
      if (!canUnlock) break;
    }
    
    if (canUnlock) {
      unlockedProblems.push(p.id);
    }
  }

  return {
    concepts: abilityMap,
    unlockedProblems
  };
}

