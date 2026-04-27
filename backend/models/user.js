const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'customer'
  },
  // ✅ ADD THESE
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },

  // ── Profile extras ──
  dob:    { type: String, default: '' },
  gender: { type: String, default: '' },

  // ── Saved delivery addresses ──
  addresses: [{
    name:      { type: String, default: '' },
    phone:     { type: String, default: '' },
    addr1:     { type: String, default: '' },
    addr2:     { type: String, default: '' },
    city:      { type: String, default: '' },
    state:     { type: String, default: '' },
    pin:       { type: String, default: '' },
    type:      { type: String, default: 'Home' },
    isDefault: { type: Boolean, default: false },
  }]

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);