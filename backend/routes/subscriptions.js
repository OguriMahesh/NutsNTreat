const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscriptions');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/subscriptions — create a new subscription (public)
router.post('/', async (req, res) => {
  try {
    const sub = await Subscription.create({
      plan:         req.body.plan,
      price:        req.body.price,
      deliverySlot: req.body.deliverySlot || 'Morning (7–10 AM)',
      deliveryDay:  req.body.deliveryDay  || 1,
      status:       'Pending',
      customerName: req.body.customerName || 'Guest',
      email:        req.body.email        || '',
      phone:        req.body.phone        || '',
      user:         req.body.user         || null,
    });
    res.status(201).json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subscriptions — list all (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const subs = await Subscription.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/subscriptions/:id — update status (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/subscriptions/:id — unsubscribe
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Subscription.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subscriptions/my — user's own subscriptions
router.get('/my', protect, async (req, res) => {
  try {
    const subs = await Subscription.find({ 
      $or: [{ user: req.user._id }, { email: req.user.email }]
    }).sort({ createdAt: -1 });
    res.json(subs);
  } catch(err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;