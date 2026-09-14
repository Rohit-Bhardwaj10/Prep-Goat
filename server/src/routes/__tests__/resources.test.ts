import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { resourcesRouter } from '../resources';
import { prisma } from '../../auth';

vi.mock('../../auth', () => ({
  prisma: {
    learningPath: {
      findMany: vi.fn(),
    },
    resource: {
      findUnique: vi.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/resources', resourcesRouter);

describe('Resources API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/resources', () => {
    it('should return learning paths', async () => {
      const mockPaths = [
        {
          id: 'path1',
          title: 'System Design Basics',
          description: 'Core concepts',
          items: [
            {
              id: 'item1',
              order: 1,
              resource: {
                id: 'res1',
                slug: 'cap-theorem',
                title: 'CAP Theorem',
              },
            },
          ],
        },
      ];

      (prisma.learningPath.findMany as any).mockResolvedValue(mockPaths);

      const res = await request(app).get('/api/resources');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPaths);
      expect(prisma.learningPath.findMany).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      (prisma.learningPath.findMany as any).mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/resources');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch resources' });
    });
  });

  describe('GET /api/resources/:slug', () => {
    it('should return a single resource', async () => {
      const mockResource = {
        id: 'res1',
        slug: 'cap-theorem',
        title: 'CAP Theorem',
        content: 'Content here',
      };

      (prisma.resource.findUnique as any).mockResolvedValue(mockResource);

      const res = await request(app).get('/api/resources/cap-theorem');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResource);
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { slug: 'cap-theorem' },
      });
    });

    it('should return 404 if resource not found', async () => {
      (prisma.resource.findUnique as any).mockResolvedValue(null);

      const res = await request(app).get('/api/resources/unknown');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Resource not found' });
    });

    it('should return 500 on database error', async () => {
      (prisma.resource.findUnique as any).mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/resources/cap-theorem');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch resource' });
    });
  });
});
