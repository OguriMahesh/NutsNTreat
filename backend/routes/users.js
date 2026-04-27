const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/user');

// ── Auth middleware — decodes Bearer token → req.user.id ──
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -otp -otpExpiry -resetToken -resetTokenExpiry');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/profile — updates name, phone, dob, gender only
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'dob', 'gender'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: false }
    ).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.addresses || []);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/addresses
router.post('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.addresses) user.addresses = [];
    if (user.addresses.length === 0 || req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
      req.body.isDefault = true;
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/addresses/default  ← MUST be before /:addrId
router.put('/addresses/default', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.addresses.forEach(a => {
      a.isDefault = (a._id.toString() === String(req.body.addressId));
    });
    await user.save();
    res.json(user.addresses);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/addresses/:addrId
router.put('/addresses/:addrId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    res.json(user.addresses);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/addresses/:addrId
router.delete('/addresses/:addrId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    if (addr.isDefault) return res.status(400).json({ error: 'Cannot delete default address' });
    addr.deleteOne();
    await user.save();
    res.json(user.addresses);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;