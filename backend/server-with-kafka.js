const express = require('express');
const mongoose = require('mongoose');
const session = require('./config/session-mongo');
const { startConsumer } = require('./kafka/consumer');

const app = express();

// Middleware
app.use(express.json());
app.use(session);

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Start Kafka Consumer
startConsumer().catch(console.error);

// Routes with Kafka integration
app.use('/bookings', require('./routes/bookings-kafka'));
app.use('/auth', require('./routes/auth'));
app.use('/listings', require('./routes/listings'));

app.listen(4000, () => console.log('🚀 Server on port 4000 with Kafka'));
