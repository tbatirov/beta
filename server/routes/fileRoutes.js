import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get all files for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = await prisma.file.findMany({
      where: { projectId },
    });
    res.json(files);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch files' });
  }
});

// Upload file
router.post('/upload/:projectId', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileRecord = await prisma.file.create({
      data: {
        name: file.originalname,
        type: path.extname(file.originalname),
        path: file.path,
        projectId,
      },
    });

    res.json(fileRecord);
  } catch (error) {
    res.status(400).json({ error: 'Failed to upload file' });
  }
});

// Delete file
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.file.delete({ where: { id } });
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete file' });
  }
});

export default router;