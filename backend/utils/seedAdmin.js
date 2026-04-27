const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin() {
  try {
    const User = mongoose.models.User || require('../routes/auth').User;

    // Dynamically get User model (already registered by auth route)
    const UserModel = mongoose.models.User;
    if (!UserModel) {
      console.log('⚠️  seedAdmin: User model not found, skipping seed');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nutsNtreat.in';
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@1234';

    const existing = await UserModel.findOne({ email: adminEmail });
    if (existing) {
      console.log('✅ Admin already exists:', adminEmail);
      return;
    }

    const hashed = await bcrypt.hash(adminPass, 10);
    await UserModel.create({
      name:       'Admin',
      email:      adminEmail,
      password:   hashed,
      role:       'admin',
      isVerified: true,
    });

    console.log('🌱 Admin seeded:', adminEmail);
  } catch (err) {
    console.error('❌ seedAdmin error:', err.message);
  }
};