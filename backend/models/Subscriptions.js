const mongoose = require('mongoose');

const subSchema = new mongoose.Schema({
  plan:         { type: String, required: true },
  price:        { type: Number, required: true },
  deliverySlot: { type: String, default: 'Morning (7–10 AM)' },
  deliveryDay:  { type: Number, default: 1 },
  status:       { type: String, enum: ['Pending','Active','Paused','Cancelled'], default: 'Pending' },
  customerName: { type: String, default: 'Guest' },
  email:        { type: String, default: '' },
  phone:        { type: String, default: '' },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subSchema);