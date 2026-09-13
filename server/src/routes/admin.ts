import { Router } from 'express';
import { auth, prisma } from '../auth';

const router = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: No session' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply middleware to all /admin routes
router.use(requireAdmin);

// ==========================================
// PROBLEMS API
// ==========================================

// Get all problems
router.get('/problems', async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ problems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get a single problem
router.get('/problems/:id', async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
    });
    if (!problem) return res.status(404).json({ error: 'Not found' });
    res.json({ problem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// Create a problem
router.post('/problems', async (req, res) => {
  try {
    const { title, description, type, difficulty, requirements, constraints, tags, testCases, extensibilityHooks, hints, sampleSolution } = req.body;
    
    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        type: type || 'LLD',
        difficulty: difficulty || 'MEDIUM',
        requirements: requirements || [],
        constraints: constraints || [],
        tags: tags || [],
        testCases: testCases || [],
        extensibilityHooks: extensibilityHooks || [],
        hints: hints || [],
        sampleSolution,
      },
    });
    res.status(201).json({ problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// Update a problem
router.put('/problems/:id', async (req, res) => {
  try {
    const { title, description, type, difficulty, requirements, constraints, tags, testCases, extensibilityHooks, hints, sampleSolution } = req.body;
    
    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        type,
        difficulty,
        requirements,
        constraints,
        tags,
        testCases,
        extensibilityHooks,
        hints,
        sampleSolution,
      },
    });
    res.json({ problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// Delete a problem
router.delete('/problems/:id', async (req, res) => {
  try {
    await prisma.problem.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// ==========================================
// RESOURCES API
// ==========================================

// Get all resources
router.get('/resources', async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get a single resource
router.get('/resources/:id', async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
    });
    if (!resource) return res.status(404).json({ error: 'Not found' });
    res.json({ resource });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Create a resource
router.post('/resources', async (req, res) => {
  try {
    const { title, slug, content } = req.body;
    const resource = await prisma.resource.create({
      data: { title, slug, content },
    });
    res.status(201).json({ resource });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update a resource
router.put('/resources/:id', async (req, res) => {
  try {
    const { title, slug, content } = req.body;
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { title, slug, content },
    });
    res.json({ resource });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete a resource
router.delete('/resources/:id', async (req, res) => {
  try {
    await prisma.resource.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
