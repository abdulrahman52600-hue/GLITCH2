import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { db } from '../db/database.js';

const router = express.Router();
router.get('/', authenticate, async (req, res) => {
  const notifications = await db.getNotifications(req.user._id);
  res.json({ success: true, notifications, unreadCount: notifications.filter(item => !item.readAt).length });
});
router.patch('/read-all', authenticate, async (req, res) => {
  await db.markAllNotificationsRead(req.user._id);
  res.json({ success: true });
});
router.patch('/:id/read', authenticate, async (req, res) => {
  const notification = await db.markNotificationRead(req.user._id, req.params.id);
  if (!notification) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ success: true, notification });
});
export default router;
