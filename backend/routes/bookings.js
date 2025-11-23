const { sendBookingCreatedEvent, sendBookingStatusUpdateEvent } = require("../services/kafkaService");

// backend/routes/bookings.js - COMPLETE BOOKING MANAGEMENT
const express = require('express');
const router = express.Router();
const { Booking, Listing, User } = require('../models');
const { ensureAuth } = require('../middleware/auth');

// POST /bookings - Create a booking request (TRAVELER)
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests, message } = req.body;

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get listing
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if user is trying to book their own property
    if (listing.ownerId === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot book your own property' });
    }

    // Validate guest count
    if (guests > listing.maxGuests) {
      return res.status(400).json({ 
        error: `Property allows maximum ${listing.maxGuests} guests` 
      });
    }

    // Calculate total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ error: 'Invalid dates' });
    }

    const totalPrice = nights * parseFloat(listing.pricePerNight);

    // Check availability (dates not blocked)
    if (listing.blockedDates && listing.blockedDates.length > 0) {
      for (const block of listing.blockedDates) {
        const blockFrom = new Date(block.from);
        const blockTo = new Date(block.to);
        
        if (
          (checkInDate >= blockFrom && checkInDate < blockTo) ||
          (checkOutDate > blockFrom && checkOutDate <= blockTo) ||
          (checkInDate <= blockFrom && checkOutDate >= blockTo)
        ) {
          return res.status(400).json({ 
            error: 'Selected dates are not available' 
          });
        }
      }
    }

    // Create booking
    const booking = await Booking.create({
      listingId,
      travelerId: req.session.user.id,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: 'pending',
      message: message || null
    });

    // Fetch complete booking with relations
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'city', 'pricePerNight', 'images']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Send Kafka event for new booking
    await sendBookingCreatedEvent({
      id: completeBooking.id,
      listingId: completeBooking.listingId,
      travelerId: completeBooking.travelerId,
      checkIn: completeBooking.checkIn,
      checkOut: completeBooking.checkOut,
      totalPrice: completeBooking.totalPrice,
      status: completeBooking.status
    });

    res.status(201).json({
      message: 'Booking request created successfully',
      booking: completeBooking
    });
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });

    // Send Kafka event for new booking
    await sendBookingCreatedEvent({
      id: completeBooking.id,
      listingId: completeBooking.listingId,
      travelerId: completeBooking.travelerId,
      checkIn: completeBooking.checkIn,
      checkOut: completeBooking.checkOut,
      totalPrice: completeBooking.totalPrice,
      status: completeBooking.status
    });
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /bookings - Get user's bookings (TRAVELER & OWNER)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const { status, role } = req.query;
    const userId = req.session.user.id;

    let where = {};
    let include = [];

    if (role === 'traveler' || req.session.user.role === 'traveler') {
      // Traveler: Get bookings they made
      where.travelerId = userId;
      include = [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'city', 'country', 'pricePerNight', 'images', 'propertyType'],
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        }
      ];
    } else if (role === 'owner' || req.session.user.role === 'owner') {
      // Owner: Get bookings for their properties
      const listings = await Listing.findAll({
        where: { ownerId: userId },
        attributes: ['id']
      });
      
      const listingIds = listings.map(l => l.id);
      where.listingId = { [require('sequelize').Op.in]: listingIds };
      
      include = [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'city', 'country', 'pricePerNight', 'images']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ];
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    const bookings = await Booking.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });

    res.json({ bookings });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

// GET /bookings/my - Get current user's bookings (FOR MY BOOKINGS PAGE)
// IMPORTANT: Must be BEFORE /:id route
router.get('/my', ensureAuth, async (req, res) => {
  try {
    console.log('🔍 Fetching bookings for user:', req.session.user.id);
    
    const bookings = await Booking.findAll({
      where: { travelerId: req.session.user.id },
      include: [{
        model: Listing,
        as: 'listing',
        attributes: [
          'id', 'title', 'description', 'city', 'country',
          'pricePerNight', 'maxGuests', 'bedrooms', 'bathrooms',
          'propertyType', 'amenities', 'images', 'status'
        ],
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'city', 'country']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Found bookings:', bookings.length);

    // Format response to match frontend expectations
    const formattedBookings = bookings.map(booking => {
      const bookingData = booking.toJSON ? booking.toJSON() : booking;
      const listing = bookingData.listing || bookingData.Listing || {};
      
      return {
        id: bookingData.id,
        userId: bookingData.travelerId,
        listingId: bookingData.listingId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice: bookingData.totalPrice,
        status: bookingData.status,
        message: bookingData.message || '',
        createdAt: bookingData.createdAt,
        updatedAt: bookingData.updatedAt,
        listing: {
          id: listing.id,
          title: listing.title || 'Property',
          description: listing.description || '',
          city: listing.city || 'N/A',
          country: listing.country || 'USA',
          pricePerNight: listing.pricePerNight || 0,
          maxGuests: listing.maxGuests || 1,
          bedrooms: listing.bedrooms || 0,
          bathrooms: listing.bathrooms || 0,
          propertyType: listing.propertyType || 'apartment',
          amenities: listing.amenities || [],
          images: listing.images || [],
          status: listing.status || 'active',
          owner: listing.owner || listing.Owner || null
        }
      };
    });

    res.json({ 
      count: formattedBookings.length,
      bookings: formattedBookings
    });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ 
      error: 'Failed to load bookings',
      bookings: [] 
    });
  }
});

// GET /bookings/history/traveler - Get traveler's booking history
// IMPORTANT: Must be BEFORE /:id route
router.get('/history/traveler', ensureAuth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { 
        travelerId: req.session.user.id,
        status: { [require('sequelize').Op.in]: ['accepted', 'cancelled'] }
      },
      include: [{
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'city', 'country', 'images']
      }],
      order: [['checkOut', 'DESC']]
    });

    res.json({ bookings });
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// GET /bookings/:id - Get single booking details
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Listing,
          as: 'listing',
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    const isOwner = booking.listing.ownerId === req.session.user.id;
    const isTraveler = booking.travelerId === req.session.user.id;

    if (!isOwner && !isTraveler) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ booking });
  } catch (err) {
    console.error('❌ Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to load booking' });
  }
});

// PUT /bookings/:id/accept - Accept booking (OWNER ONLY)
router.put('/:id/accept', ensureAuth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify owner
    if (booking.listing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: 'Only property owner can accept bookings' });
    }

    // Check if already accepted or cancelled
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot accept booking with status: ${booking.status}` 
      });
    }

    // Update booking status
    await booking.update({ status: 'accepted' });

    // Block dates in listing
    const listing = await Listing.findByPk(booking.listingId);
    const blockedDates = listing.blockedDates || [];
    blockedDates.push({
      from: booking.checkIn,
      to: booking.checkOut,
      bookingId: booking.id
    });
    await listing.update({ blockedDates });

    res.json({ 
      message: 'Booking accepted and dates blocked',
      booking 
    });
  } catch (err) {
    console.error('❌ Error accepting booking:', err);
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

// PUT /bookings/:id/reject - Reject booking (OWNER ONLY)
router.put('/:id/reject', ensureAuth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.listing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: 'Only property owner can reject bookings' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot reject booking with status: ${booking.status}` 
      });
    }

    await booking.update({ status: 'rejected' });

    res.json({ 
      message: 'Booking rejected',
      booking 
    });
  } catch (err) {
    console.error('❌ Error rejecting booking:', err);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// PUT /bookings/:id/cancel - Cancel booking (OWNER OR TRAVELER)
router.put('/:id/cancel', ensureAuth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isOwner = booking.listing.ownerId === req.session.user.id;
    const isTraveler = booking.travelerId === req.session.user.id;

    if (!isOwner && !isTraveler) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update status
    await booking.update({ status: 'cancelled' });

    // If was accepted, release blocked dates
    if (booking.status === 'accepted') {
      const listing = await Listing.findByPk(booking.listingId);
      const blockedDates = (listing.blockedDates || []).filter(
        block => block.bookingId !== booking.id
      );
      await listing.update({ blockedDates });
    }

    res.json({ 
      message: 'Booking cancelled and dates released',
      booking 
    });
  } catch (err) {
    console.error('❌ Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
