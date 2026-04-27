const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  category:    { type: String, default: 'General' },
  weight:      { type: String, default: '250g' },
  badge:       { type: String, default: '' },
  rating:      { type: Number, default: 4.5 },
  stock:       { type: Number, default: 0 },
  image:       { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);