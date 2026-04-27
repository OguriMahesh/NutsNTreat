const mongoose = require("mongoose");

// NOTE: routes/orders.js defines and registers this schema itself using
// mongoose.models.Order || mongoose.model('Order', ...).
// This file is kept for any imports that require('../models/orders').
// It safely re-uses the already-registered model to avoid OverwriteModelError.

const orderSchema = new mongoose.Schema({
  orderId:       { type: String, unique: true },
  customerName:  { type: String, required: true },
  email:         { type: String, required: true },
  phone:         { type: String, default: '' },
  address:       { type: String, default: '' },
  notes:         { type: String, default: '' },
  items: [{
    id:     { type: String },
    name:   { type: String },
    price:  { type: Number },
    qty:    { type: Number },
    img:    { type: String },
    weight: { type: String },
    cat:    { type: String },
  }],
  subtotal:      { type: Number, default: 0 },
  shipping:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  gst:           { type: Number, default: 0 },
  total:         { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  status: {
    type: String,
    default: 'Placed',
    enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  },
  emailSent: { type: Boolean, default: false },
  smsSent:   { type: Boolean, default: false },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);