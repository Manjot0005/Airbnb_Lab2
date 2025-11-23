// backend/app.js - Express Application Setup
const express = require('express');
const cors = require('cors');
const path = require('path');
const sessionConfig = require('./config/session');

const app = express();

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(sessionConfig);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== ROUTES ====================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Airbnb Clone API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/test',
      auth: '/auth (signup, login, logout)',
      profile: '/api/profile',
      listings: '/listings (search properties)',
      bookings: '/bookings',
      favorites: '/favorites',
      owner: '/owner (owner dashboard & management)'
    },
    documentation: 'See README for full API documentation'
  });
});

// Health check
app.get('/test', (req, res) => {
  res.json({
    message: 'API Server is running!',
    timestamp: new Date().toISOString(),
    session: req.session.id,
    user: req.session.user || null,
  });
});

// API Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/owner', require('./routes/owner'));
app.use('/listings', require('./routes/listings'));
app.use('/bookings', require('./routes/bookings'));
app.use('/favorites', require('./routes/favorites'));

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Multer file upload errors
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  
  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: err.errors.map(e => e.message)
    });
  }
  
  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ 
      error: 'Duplicate entry',
      field: err.errors[0].path
    });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;