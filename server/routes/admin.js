import express from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

function safeUser(user) {
  const { password, passwordHash, ...publicFields } = user;
  return publicFields;
}

// Get Admin platform statistics
router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users for admin management
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    if (role && !['student', 'company', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid user role filter.' });
    const users = await db.getUsers(role);
    res.json({ success: true, count: users.length, users: users.map(safeUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project status (e.g., Close/Approve/Feature)
router.patch('/projects/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'Closed'].includes(status)) return res.status(400).json({ error: 'Project status must be Open or Closed.' });
    const updated = await db.updateProject(req.params.id, { status });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
