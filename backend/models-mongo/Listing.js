const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  propertyType: { type: String, default: 'apartment' },
  city: { type: String, required: true },
  country: { type: String, default: 'USA' },
  address: String,
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, default: 1 },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  amenities: [String],
  images: [String],
  availableFrom: Date,
  availableTo: Date,
  blockedDates: [{
    from: Date,
    to: Date,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }],
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
