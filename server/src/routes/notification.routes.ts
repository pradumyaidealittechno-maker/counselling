import express from 'express';
import notificationService from '../services/notification.service.js';

const router = express.Router();

// Get all notifications for authenticated user (with pagination)
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getNotificationsForUser(userId, page, limit);

    res.json(result);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({ count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.json(notification);
  } catch (error: any) {
    console.error('Mark as read error:', error);
    if (error.message === 'Notification not found or unauthorized') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const result = await notificationService.markAllAsRead(userId);

    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = req.params.id;

    await notificationService.deleteNotification(notificationId, userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    if (error.message === 'Notification not found or unauthorized') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
