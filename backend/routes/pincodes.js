const express = require('express');
const router  = express.Router();
const Pincode = require('../models/Pincode');

// GET all pincodes
router.get('/', async (req, res) => {
  try {
    const pincodes = await Pincode.find().sort({ city: 1, pincode: 1 });
    res.json({ success: true, pincodes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET active pincodes only (used by Dailyplans.html to check)
router.get('/active', async (req, res) => {
  try {
    const pincodes = await Pincode.find({ isActive: true }).sort({ city: 1 });
    res.json({ success: true, pincodes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add new pincode
router.post('/', async (req, res) => {
  try {
    const { pincode, area, city } = req.body;
    if (!pincode || !area || !city)
      return res.status(400).json({ success: false, error: 'All fields required' });
    const existing = await Pincode.findOne({ pincode });
    if (existing)
      return res.status(400).json({ success: false, error: 'Pincode already exists' });
    const newPin = await Pincode.create({ pincode, area, city });
    res.json({ success: true, pincode: newPin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT toggle active/inactive
router.put('/:id/toggle', async (req, res) => {
  try {
    const pin = await Pincode.findById(req.params.id);
    if (!pin)
      return res.status(404).json({ success: false, error: 'Pincode not found' });
    pin.isActive = !pin.isActive;
    await pin.save();
    res.json({ success: true, pincode: pin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE pincode
router.delete('/:id', async (req, res) => {
  try {
    await Pincode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pincode deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;