const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendWelcomeEmail, sendResetEmail } = require('../utils/email');
const User = require('../models/user'); // ← uses your user.js model

// ── REGISTER ──
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({ name, email, phone, password: hashed, otp, otpExpiry });
    console.log(`✅ New customer registered: ${name} (${email})`);

    try {
      await sendOTPEmail({ to: email, name, otp });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (mailErr) {
      console.error('❌ Email failed:', mailErr.message);
      console.log(`📧 DEV OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'Registered successfully. Check your email for OTP.', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── LOGIN ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.isVerified)
      return res.status(403).json({ error: 'Please verify your email first' });

    if (user.isActive === false)
      return res.status(403).json({ error: 'Your account has been disabled. Contact support.' });

    const expireDays = parseInt((process.env.JWT_EXPIRE || '7d').replace('d', '')) || 7;
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      exp: Date.now() + expireDays * 24 * 60 * 60 * 1000,
      user: { name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── VERIFY OTP ──
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.otp)
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });

    if (user.otp !== otp)
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    console.log(`✅ Email verified for: ${user.email}`);

    try {
      await sendWelcomeEmail({ to: user.email, name: user.name });
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── RESEND OTP ──
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isVerified)
      return res.status(400).json({ error: 'Account is already verified.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail({ to: user.email, name: user.name, otp });
      console.log(`✅ OTP resent to ${user.email}`);
    } catch (mailErr) {
      console.error('❌ Email failed:', mailErr.message);
      console.log(`📧 DEV OTP for ${user.email}: ${otp}`);
    }

    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── FORGOT PASSWORD ──
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });

    // Always respond with success to prevent user enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken       = token;
    user.resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${token}`;

    try {
      await sendResetEmail({ to: user.email, name: user.name, resetLink });
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (mailErr) {
      console.error('❌ Reset email failed:', mailErr.message);
      console.log(`🔗 DEV reset link for ${user.email}: ${resetLink}`);
    }

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── RESET PASSWORD ──
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: 'Token and new password are required' });

    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user)
      return res.status(400).json({ error: 'Invalid or expired reset token. Please request a new link.' });

    // Hash new password and clear reset token
    user.password         = await bcrypt.hash(newPassword, 10);
    user.resetToken       = null;
    user.resetTokenExpiry = null;
    await user.save();

    console.log(`✅ Password reset successful for: ${user.email}`);
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;