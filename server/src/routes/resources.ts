import { Router } from "express";
import { prisma } from "../auth"; // Assuming prisma is exported here

const router = Router();

// GET /api/resources
// Fetches all learning paths and their associated resources
router.get("/", async (req, res) => {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            resource: {
              select: {
                id: true,
                slug: true,
                title: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(paths);
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// GET /api/resources/:slug
// Fetches a single resource by its slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { slug }
    });

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

export const resourcesRouter = router;
