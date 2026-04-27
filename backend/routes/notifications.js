const express = require('express');
const router  = express.Router();
const Notification = require('../models/Notification');

// ── GET all notifications (admin panel) ──
// GET /api/notifications?unreadOnly=true&limit=50
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unreadOnly === 'true') filter.read = false;

    const limit = parseInt(req.query.limit) || 50;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({ notifications, unreadCount, total: notifications.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT mark one as read ──
// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT mark ALL as read ──
// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE all notifications ──
// DELETE /api/notifications
router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE single notification ──
// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;