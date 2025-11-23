// backend/config/session.js - Session Configuration
const session = require('express-session');

const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'supersecret_value',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  },
  name: 'airbnb.sid', // Custom session cookie name
});

module.exports = sessionConfig;
