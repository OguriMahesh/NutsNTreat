const express = require("express");
const router  = express.Router();
const Cart    = require("../models/cart");

// ── GET /api/cart/:userId ──
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    // Always return { items: [] } shape — never null
    res.json({ items: cart ? (cart.items || []) : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/cart/:userId — full replace ──
router.put("/:userId", async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const cart  = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { userId: req.params.userId, items },
      { upsert: true, new: true }
    );
    res.json({ items: cart.items || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/cart/:userId/add — add single item (increments qty if exists) ──
router.post("/:userId/add", async (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) return res.status(400).json({ error: 'item.id required' });

    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) cart = new Cart({ userId: req.params.userId, items: [] });

    const existing = cart.items.find(i => String(i.id) === String(item.id));
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.items.push({ ...item, qty: item.qty || 1 });

    await cart.save();
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/cart/:userId/:itemId ──
router.delete("/:userId/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.json({ items: [] });
    cart.items = cart.items.filter(i => String(i.id) !== String(req.params.itemId));
    await cart.save();
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;