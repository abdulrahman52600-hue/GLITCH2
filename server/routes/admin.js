import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Get Admin platform statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users for admin management
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const users = await db.getUsers(role);
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project status (e.g., Close/Approve/Feature)
router.patch('/projects/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.updateProject(req.params.id, { status });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
