const { sendBookingStatusUpdateEvent } = require("../services/kafkaService");

// backend/routes/owner.js - COMPLETE OWNER FEATURES
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Listing, Booking, User } = require('../models');
const { ensureAuth, ensureOwner } = require('../middleware/auth');
const { Op } = require('sequelize');

// Setup uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
  const hasValidExtension = allowedExtensions.test(file.originalname);

  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/webp', 'image/avif', 'image/avif-sequence',
    'application/octet-stream'
  ];
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (hasValidExtension || hasValidMimeType) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.originalname}`));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ==================== PROPERTY MANAGEMENT ====================

// POST /owner/listings - Create new property
router.post('/listings', ensureAuth, ensureOwner, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title, description, propertyType, city, country, address,
      pricePerNight, maxGuests, bedrooms, bathrooms, amenities,
      availableFrom, availableTo
    } = req.body;

    if (!title || !city || !pricePerNight || !maxGuests) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const imagePaths = req.files?.map(
      file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    ) || [];

    const listing = await Listing.create({
      ownerId: req.session.user.id,
      title,
      description,
      propertyType: propertyType || 'apartment',
      city,
      country: country || 'USA',
      address,
      pricePerNight: parseFloat(pricePerNight),
      maxGuests: parseInt(maxGuests),
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseFloat(bathrooms) || 1,
      amenities: amenities ? JSON.parse(amenities) : [],
      images: imagePaths,
      availableFrom,
      availableTo,
      status: 'active'
    });

    res.status(201).json({
      message: 'Property created successfully',
      listing
    });
  } catch (err) {
    console.error('❌ Error creating listing:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// GET /owner/listings - Get owner's properties
router.get('/listings', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { ownerId: req.session.user.id },
      include: [{
        model: Booking,
        as: 'bookings',
        include: [{
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email', 'phone']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ listings });
  } catch (err) {
    console.error('❌ Error fetching listings:', err);
    res.status(500).json({ error: 'Failed to load properties' });
  }
});

// GET /owner/listings/:id - Get single property
router.get('/listings/:id', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const listing = await Listing.findOne({
      where: { 
        id: req.params.id,
        ownerId: req.session.user.id 
      },
      include: [{
        model: Booking,
        as: 'bookings',
        include: [{
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email', 'phone']
        }]
      }]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ listing });
  } catch (err) {
    console.error('❌ Error fetching listing:', err);
    res.status(500).json({ error: 'Failed to load property' });
  }
});

// PUT /owner/listings/:id - Update property
router.put('/listings/:id', ensureAuth, ensureOwner, upload.array('images', 5), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse amenities if provided
    if (updateData.amenities && typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
      );
      
      const listing = await Listing.findByPk(req.params.id);
      updateData.images = [...(listing.images || []), ...newImages];
    }

    const [updated] = await Listing.update(updateData, {
      where: { 
        id: req.params.id,
        ownerId: req.session.user.id 
      }
    });

    if (updated === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const listing = await Listing.findByPk(req.params.id);
    res.json({ 
      message: 'Property updated successfully',
      listing 
    });
  } catch (err) {
    console.error('❌ Error updating listing:', err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /owner/listings/:id - Delete property
router.delete('/listings/:id', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const deleted = await Listing.destroy({
      where: { 
        id: req.params.id,
        ownerId: req.session.user.id 
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting listing:', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// GET /owner/bookings - Get all booking requests for owner's properties
router.get('/bookings', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const { status } = req.query;

    // Get owner's listing IDs
    const listings = await Listing.findAll({
      where: { ownerId: req.session.user.id },
      attributes: ['id']
    });

    const listingIds = listings.map(l => l.id);

    const where = { listingId: { [Op.in]: listingIds } };
    if (status) {
      where.status = status;
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'city', 'pricePerNight', 'images']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ bookings });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

// PUT /owner/bookings/:id/accept - Accept booking request
router.put('/bookings/:id/accept', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.listing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    await booking.update({ status: 'accepted' });

    // Send Kafka event for booking acceptance
    await sendBookingStatusUpdateEvent(
      booking.id,
      "accepted",
      req.session.user.id
    );

    // Block dates
    const listing = await Listing.findByPk(booking.listingId);
    const blockedDates = listing.blockedDates || [];
    blockedDates.push({
      from: booking.checkIn,
      to: booking.checkOut,
      bookingId: booking.id
    });
    await listing.update({ blockedDates });

    res.json({ 
      message: 'Booking accepted successfully',
      booking 
    });
  } catch (err) {
    console.error('❌ Error accepting booking:', err);
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

// PUT /owner/bookings/:id/reject - Reject booking request
router.put('/bookings/:id/reject', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.listing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    await booking.update({ status: 'rejected' });

    // Send Kafka event for booking rejection
    await sendBookingStatusUpdateEvent(
      booking.id,
      "rejected",
      req.session.user.id
    );

    res.json({ 
      message: 'Booking rejected',
      booking 
    });
  } catch (err) {
    console.error('❌ Error rejecting booking:', err);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// PUT /owner/bookings/:id/cancel - Cancel accepted booking
router.put('/bookings/:id/cancel', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.listing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await booking.update({ status: 'cancelled' });

    // Release dates
    const listing = await Listing.findByPk(booking.listingId);
    const blockedDates = (listing.blockedDates || []).filter(
      block => block.bookingId !== booking.id
    );
    await listing.update({ blockedDates });

    res.json({ 
      message: 'Booking cancelled and dates released',
      booking 
    });
  } catch (err) {
    console.error('❌ Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ==================== DASHBOARD STATS ====================

// GET /owner/dashboard - Get dashboard statistics
router.get('/dashboard', ensureAuth, ensureOwner, async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { ownerId: req.session.user.id },
      attributes: ['id']
    });

    const listingIds = listings.map(l => l.id);

    const [totalListings, pendingBookings, acceptedBookings, totalRevenue] = await Promise.all([
      Listing.count({ where: { ownerId: req.session.user.id } }),
      Booking.count({ 
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'pending'
        }
      }),
      Booking.count({ 
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'accepted'
        }
      }),
      Booking.sum('totalPrice', { 
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'accepted'
        }
      })
    ]);

    // Get recent bookings
    const recentBookings = await Booking.findAll({
      where: { listingId: { [Op.in]: listingIds } },
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalListings,
        pendingBookings,
        acceptedBookings,
        totalRevenue: totalRevenue || 0
      },
      recentBookings
    });
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;