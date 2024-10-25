import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all projects for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      include: {
        files: true,
        reports: true,
      },
    });
    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch projects' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: req.user.id,
      },
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description, status },
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete project' });
  }
});

export default router;