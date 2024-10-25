import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Start new conversion
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { projectId, fileId } = req.body;

    const conversion = await prisma.conversion.create({
      data: {
        projectId,
        fileId,
        steps: {
          create: [
            { type: 'FILE_PARSING' },
            { type: 'DATA_CLEANING' },
            { type: 'GAAP_TO_IFRS' },
            { type: 'RECONCILIATION' },
            { type: 'DISCLOSURE_GENERATION' },
            { type: 'FINANCIAL_HEALTH_ANALYSIS' },
            { type: 'REPORT_GENERATION' }
          ]
        }
      },
      include: {
        steps: true
      }
    });

    res.json(conversion);
  } catch (error) {
    res.status(400).json({ error: 'Failed to start conversion' });
  }
});

// Update conversion step
router.put('/step/:stepId', authenticateToken, async (req, res) => {
  try {
    const { stepId } = req.params;
    const { status, data, error } = req.body;

    const step = await prisma.conversionStep.update({
      where: { id: stepId },
      data: {
        status,
        data: data || undefined,
        error: error || undefined,
        startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    });

    // Update conversion status if all steps are completed
    if (status === 'COMPLETED') {
      const conversion = await prisma.conversion.findFirst({
        where: { steps: { some: { id: stepId } } },
        include: { steps: true }
      });

      if (conversion && conversion.steps.every(s => s.status === 'COMPLETED')) {
        await prisma.conversion.update({
          where: { id: conversion.id },
          data: { status: 'COMPLETED' }
        });
      }
    }

    res.json(step);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update conversion step' });
  }
});

// Get conversion details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conversion = await prisma.conversion.findUnique({
      where: { id },
      include: {
        steps: true,
        reports: true,
        file: true
      }
    });
    res.json(conversion);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch conversion' });
  }
});

// Update conversion data
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { originalData, convertedData, explanations, recommendations } = req.body;

    const conversion = await prisma.conversion.update({
      where: { id },
      data: {
        originalData,
        convertedData,
        explanations,
        recommendations
      }
    });

    res.json(conversion);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update conversion' });
  }
});

export default router;