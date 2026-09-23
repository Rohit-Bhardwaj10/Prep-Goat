import { Router, Request, Response } from 'express';
import { prisma } from '../auth';

const router = Router();

// GET /api/problems — list all problems with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (difficulty && difficulty !== 'All') {
      where.difficulty = difficulty;
    }
    
    if (type && type !== 'All') {
      where.type = type;
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          difficulty: true,
          tags: true,
          requirements: true,
          constraints: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ]);

    res.json({
      problems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /api/problems]', err);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/problems/:id — single problem with full requirements
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const problem = await prisma.problem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        difficulty: true,
        tags: true,
        requirements: true,
        constraints: true,
        testCases: true,
        extensibilityHooks: true,
        createdAt: true,
      },
    });
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }
    res.json({ problem });
  } catch (err) {
    console.error(`[GET /api/problems/${id}]`, err);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

export default router;
