// backend/server.js - Complete Server with All Routes
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const { initProducer, initConsumer } = require("./config/kafka");
const { startBookingEventConsumer } = require("./services/kafkaService");

const app = express();
const PORT = process.env.PORT || 4000;

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
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret_value',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROUTES ====================

// Root route - API Info
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Airbnb Clone API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /test',
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        me: 'GET /auth/me'
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PUT /api/profile'
      },
      listings: {
        search: 'GET /listings',
        details: 'GET /listings/:id',
        availability: 'GET /listings/:id/availability'
      },
      bookings: {
        create: 'POST /bookings',
        list: 'GET /bookings',
        details: 'GET /bookings/:id',
        accept: 'PUT /bookings/:id/accept',
        reject: 'PUT /bookings/:id/reject',
        cancel: 'PUT /bookings/:id/cancel'
      },
      favorites: {
        add: 'POST /favorites',
        list: 'GET /favorites',
        remove: 'DELETE /favorites/:listingId'
      },
      owner: {
        listings: 'GET /owner/listings',
        createListing: 'POST /owner/listings',
        bookings: 'GET /owner/bookings',
        dashboard: 'GET /owner/dashboard'
      }
    },
    documentation: 'See API_TESTING_GUIDE.md for examples'
  });
});

// Health check
app.get('/test', (req, res) => {
  res.json({
    message: 'API Server is running! ✅',
    timestamp: new Date().toISOString(),
    session: req.session.id,
    user: req.session.user || null,
    database: 'Connected',
    environment: process.env.NODE_ENV || 'development'
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
    path: req.path,
    suggestion: 'Visit / for API documentation'
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

// ==================== SERVER STARTUP ====================

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');

    // Initialize Kafka
    try {
      await initProducer();
      await initConsumer();
      await startBookingEventConsumer();
      console.log("✅ Kafka initialized successfully");
    } catch (kafkaError) {
      console.error("⚠️  Kafka initialization failed:", kafkaError.message);
      console.log("⚠️  Server will continue without Kafka");
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Visit http://localhost:${PORT}/ for API info`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;