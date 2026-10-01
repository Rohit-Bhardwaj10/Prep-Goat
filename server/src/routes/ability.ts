import { Router, Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import { computeAbility } from '../services/ability';

const router = Router();

// Helper to get the current session from the request
async function getSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

// GET /api/ability — fetch the user's ability map and unlocked problems
router.get('/', async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const ability = await computeAbility(session.user.id);
    res.json(ability);
  } catch (err) {
    console.error('[GET /api/ability]', err);
    res.status(500).json({ error: 'Failed to compute ability map' });
  }
});

export default router;
