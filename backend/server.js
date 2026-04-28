require('dotenv').config(); // MUST be first line

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// ── Middleware ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);
// ── Static Files ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assests', express.static(path.join(__dirname, '../frontend/pages/assests')));
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// Serve any HTML page directly
app.get('/:page.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages', req.params.page + '.html'), err => {
    if (err) res.status(404).json({ error: 'Page not found' });
  });
});

// ── Routes ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/contacts',      require('./routes/contacts'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/cart',          require('./routes/cart'));
app.use('/api/wishlist',      require('./routes/wishlist'));
app.use('/api/notifications', require('./routes/notifications')); 
app.use('/api/users',         require('./routes/users'));

// ── Health Check ──
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', app: 'NutsNTreat API', time: new Date() })
);

// ── 404 Handler ──
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

// ── Connect DB & Start ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 NutsNTreat API running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;