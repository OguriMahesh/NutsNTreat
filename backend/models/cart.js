const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id:     { type: String, required: true },
  name:   { type: String, default: '' },
  price:  { type: Number, default: 0 },
  qty:    { type: Number, default: 1 },
  img:    { type: String, default: '' },
  weight: { type: String, default: '' },
  cat:    { type: String, default: '' },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items:  { type: [cartItemSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);