const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'order',
    enum: ['order', 'contact', 'subscription', 'system']
  },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  icon:    { type: String, default: '📦' },
  read:    { type: Boolean, default: false },
  // Optional reference to the related document
  refId:   { type: String, default: null },   // e.g. order._id
  refModel:{ type: String, default: null },   // e.g. 'Order'
  // Extra data to show in the admin panel popup
  meta: {
    orderId:       { type: String, default: null },
    customerName:  { type: String, default: null },
    phone:         { type: String, default: null },
    total:         { type: Number, default: null },
    itemCount:     { type: Number, default: null },
    paymentMethod: { type: String, default: null },
  }
}, { timestamps: true });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);