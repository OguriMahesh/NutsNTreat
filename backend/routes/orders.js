const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const orderSchema = new mongoose.Schema({
  orderId:       { type: String, unique: true },
  customerName:  { type: String, required: true },
  email:         { type: String, required: true },
  phone:         { type: String, default: '' },
  address:       { type: String, default: '' },
  items: [{
    id:       String,
    name:     String,
    price:    Number,
    qty:      Number,
    img:      String,
    weight:   String,
    cat:      String,
  }],
  subtotal:      { type: Number, default: 0 },
  shipping:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  notes:         { type: String, default: '' },
  status: {
    type: String,
    default: 'Placed',
    enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  emailSent: { type: Boolean, default: false },
  smsSent:   { type: Boolean, default: false },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ── Helper: create notification for a new order ──
async function createOrderNotification(order) {
  try {
    const itemCount = (order.items || []).length;
    await Notification.create({
      type:  'order',
      icon:  '📦',
      title: `New Order — ${order.orderId}`,
      body:  `${order.customerName} placed an order for ₹${order.total} (${itemCount} item${itemCount !== 1 ? 's' : ''})`,
      refId:    order._id.toString(),
      refModel: 'Order',
      meta: {
        orderId:      order.orderId,
        customerName: order.customerName,
        phone:        order.phone || '—',
        total:        order.total,
        itemCount,
        paymentMethod: order.paymentMethod || 'COD',
      }
    });
    console.log(`🔔 Notification created for order ${order.orderId}`);
  } catch (err) {
    // Non-fatal — log but don't break the order creation response
    console.error('⚠️  Failed to create notification:', err.message);
  }
}

// ── GET all orders — admin panel, supports ?status= filter ──
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/orders/my — logged-in user's orders (requires auth middleware OR token header) ──
router.get('/my', async (req, res) => {
  try {
    // Support both auth-middleware-injected req.user and raw JWT decoding
    let userId = req.user?._id || req.user?.id;
    if (!userId && req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(
          req.headers.authorization.replace('Bearer ', ''),
          process.env.JWT_SECRET || 'fallback_secret'
        );
        userId = decoded.id || decoded._id;
      } catch(e) { /* invalid token — fall through */ }
    }
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET orders by user email (profile page) ──
router.get('/my/:email', async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET single order ──
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST create order — called by cart.html on checkout ──
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.orderId) {
      body.orderId = 'NNT' + Date.now().toString().slice(-8).toUpperCase();
    }
    const order = await Order.create(body);
    console.log(`✅ New order: ${order.orderId} by ${order.customerName}`);

    // ── Create admin notification ──
    await createOrderNotification(order);

    res.status(201).json({ order, orderId: order.orderId });
  } catch (err) {
    console.error('❌ Order error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT update status — admin panel dropdown ──
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT general update ──
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;