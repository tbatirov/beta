import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all reports for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const reports = await prisma.report.findMany({
      where: { projectId },
    });
    res.json(reports);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch reports' });
  }
});

// Create new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, content, type, projectId } = req.body;
    const report = await prisma.report.create({
      data: {
        name,
        content,
        type,
        projectId,
      },
    });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create report' });
  }
});

// Update report
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, type } = req.body;
    const report = await prisma.report.update({
      where: { id },
      data: { name, content, type },
    });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update report' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.delete({ where: { id } });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete report' });
  }
});

export default router;