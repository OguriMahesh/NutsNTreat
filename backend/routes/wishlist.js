const express  = require('express');
const router   = express.Router();
const Wishlist = require('../models/wishlist');

// ── GET /api/wishlist/:userId ──
router.get('/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    res.json({ items: wishlist ? wishlist.items : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/wishlist/:userId — full replace ──
router.put('/:userId', async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.params.userId },
      { userId: req.params.userId, items },
      { upsert: true, new: true }
    );
    res.json({ items: wishlist.items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/wishlist/:userId/add — add single item ──
router.post('/:userId/add', async (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) return res.status(400).json({ error: 'item.id is required' });

    let wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) wishlist = new Wishlist({ userId: req.params.userId, items: [] });

    const exists = wishlist.items.some(i => String(i.id) === String(item.id));
    if (!exists) wishlist.items.push(item);
    await wishlist.save();
    res.json({ items: wishlist.items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/wishlist/:userId/:itemId — remove single item ──
router.delete('/:userId/:itemId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) return res.json({ items: [] });

    wishlist.items = wishlist.items.filter(i => String(i.id) !== String(req.params.itemId));
    await wishlist.save();
    res.json({ items: wishlist.items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;