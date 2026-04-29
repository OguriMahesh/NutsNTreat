const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode:  { type: String, required: true, unique: true, trim: true },
  area:     { type: String, required: true, trim: true },
  city:     { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Pincode', pincodeSchema);