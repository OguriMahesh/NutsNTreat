const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      id:            { type: String },
      name:          { type: String },
      price:         { type: Number },
      originalPrice: { type: Number },
      img:           { type: String },
      cat:           { type: String },
      weight:        { type: String },
      rating:        { type: Number },
      reviews:       { type: Number },
      badge:         { type: String },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);