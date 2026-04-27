const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// ── Admin Auth Middleware ──
function adminOnly(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── DASHBOARD STATS ──
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const User         = mongoose.model('User');
    const Order        = mongoose.model('Order');
    const Product      = mongoose.models.Product      ? mongoose.model('Product')      : null;
    const Subscription = mongoose.models.Subscription ? mongoose.model('Subscription') : null;
    const Contact      = mongoose.models.Contact      ? mongoose.model('Contact')      : null;

    const [users, orders] = await Promise.all([
      User.find({ role: { $ne: 'admin' } }),
      Order.find(),
    ]);

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const [recentOrders, lowStock, activeSubs, newContacts, totalProducts] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(6),
      Product      ? Product.find({ stock: { $lt: 15 } }).limit(6) : [],
      Subscription ? Subscription.countDocuments({ status: 'Active' }) : 0,
      Contact      ? Contact.countDocuments({ status: 'New' }) : 0,
      Product      ? Product.countDocuments() : 0,
    ]);

    // Monthly revenue — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Sales by category
    const catSales = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
          _id: { $ifNull: ['$items.cat', 'Other'] },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
      }},
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      stats: {
        totalRevenue,
        totalOrders:   orders.length,
        totalUsers:    users.length,
        totalSubs:     activeSubs,
        totalProducts,
        newContacts,
      },
      recentOrders,
      lowStock,
      monthlyRevenue,
      catSales,
    });
  } catch (err) {
    console.error('❌ Stats error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET all customers ──
router.get('/users', adminOnly, async (req, res) => {
  try {
    const users = await mongoose.model('User')
      .find({ role: { $ne: 'admin' } })
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 });

    // Add `id` string field so admin.html toggle button works
    const normalized = users.map(u => ({
      ...u.toObject(),
      id: u._id.toString(),
    }));

    res.json({ users: normalized });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT toggle user active/disabled ──
router.put('/users/:id/toggle', adminOnly, async (req, res) => {
  try {
    const user = await mongoose.model('User').findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isActive = user.isActive === false ? true : false;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE user ──
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    await mongoose.model('User').findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;