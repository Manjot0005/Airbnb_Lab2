// backend/routes/listings.js - FIXED FOR YOUR SCHEMA
const express = require('express');
const router = express.Router();
const { Listing, User, Booking } = require('../models');
const { Op } = require('sequelize');

// ============================================
// GET /api/listings - Search and filter properties
// ============================================
router.get('/', async (req, res) => {
  try {
    const { 
      location,
      city,
      checkIn, 
      checkOut, 
      guests, 
      minPrice,
      maxPrice
    } = req.query;

    console.log('🔍 Search request:', { location, city, checkIn, checkOut, guests, minPrice, maxPrice });

    // Build where clause - NO STATUS CHECK
    const where = {};

    // Location/City filter (case-insensitive)
    if (location || city) {
      const searchCity = location || city;
      where.city = { [Op.like]: `%${searchCity}%` };
    }

    // Guest capacity filter
    if (guests) {
      where.maxGuests = { [Op.gte]: parseInt(guests) };
    }

    // Price range filter
    if (minPrice) {
      where.pricePerNight = { ...where.pricePerNight, [Op.gte]: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.pricePerNight = { ...where.pricePerNight, [Op.lte]: parseFloat(maxPrice) };
    }

    console.log('📊 WHERE clause:', JSON.stringify(where, null, 2));

    // Get all matching listings
    let listings = await Listing.findAll({
      where,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'profileImage']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${listings.length} listings before date filtering`);

    // Filter by date availability (check for conflicting bookings)
    if (checkIn && checkOut) {
      const requestedCheckIn = new Date(checkIn);
      const requestedCheckOut = new Date(checkOut);

      if (requestedCheckIn >= requestedCheckOut) {
        return res.status(400).json({ error: 'Check-out must be after check-in' });
      }

      const availableListings = [];

      for (const listing of listings) {
        // Find conflicting ACCEPTED bookings
        const conflictingBookings = await Booking.count({
          where: {
            propertyId: listing.id,
            status: 'ACCEPTED',
            [Op.or]: [
              {
                // Booking starts during requested period
                checkIn: { [Op.between]: [requestedCheckIn, requestedCheckOut] }
              },
              {
                // Booking ends during requested period
                checkOut: { [Op.between]: [requestedCheckIn, requestedCheckOut] }
              },
              {
                // Booking encompasses entire requested period
                [Op.and]: [
                  { checkIn: { [Op.lte]: requestedCheckIn } },
                  { checkOut: { [Op.gte]: requestedCheckOut } }
                ]
              }
            ]
          }
        });

        // Only include if no conflicts
        if (conflictingBookings === 0) {
          availableListings.push(listing);
        }
      }

      listings = availableListings;
      console.log(`✅ ${listings.length} available for dates ${checkIn} to ${checkOut}`);
    }

    // Format response
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      city: listing.city,
      pricePerNight: parseFloat(listing.pricePerNight),
      maxGuests: listing.maxGuests,
      description: listing.description,
      images: listing.images || [],
      ownerId: listing.ownerId,
      owner: listing.owner,
      createdAt: listing.createdAt
    }));

    console.log(`✅ Returning ${formattedListings.length} listings`);

    res.json({
      success: true,
      count: formattedListings.length,
      listings: formattedListings
    });

  } catch (err) {
    console.error('❌ Error searching listings:', err);
    res.status(500).json({ 
      error: 'Failed to search listings',
      details: err.message 
    });
  }
});

// ============================================
// GET /api/listings/:id - Get single property details
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'profileImage', 'city']
        }
      ]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get accepted bookings for unavailable dates
    const acceptedBookings = await Booking.findAll({
      where: {
        propertyId: req.params.id,
        status: 'ACCEPTED'
      },
      attributes: ['checkIn', 'checkOut'],
      order: [['checkIn', 'ASC']]
    });

    const unavailableDates = acceptedBookings.map(booking => ({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut
    }));

    res.json({ 
      success: true,
      listing: {
        ...listing.toJSON(),
        unavailableDates
      }
    });

  } catch (err) {
    console.error('❌ Error fetching listing:', err);
    res.status(500).json({ 
      error: 'Failed to load property',
      details: err.message 
    });
  }
});

// ============================================
// GET /api/listings/:id/availability - Check availability
// ============================================
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'Check-in and check-out dates required' });
    }

    const listing = await Listing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);

    if (requestedCheckIn >= requestedCheckOut) {
      return res.json({ 
        available: false,
        reason: 'Invalid date range'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        propertyId: req.params.id,
        status: 'ACCEPTED',
        [Op.or]: [
          { checkIn: { [Op.between]: [requestedCheckIn, requestedCheckOut] } },
          { checkOut: { [Op.between]: [requestedCheckIn, requestedCheckOut] } },
          {
            [Op.and]: [
              { checkIn: { [Op.lte]: requestedCheckIn } },
              { checkOut: { [Op.gte]: requestedCheckOut } }
            ]
          }
        ]
      }
    });

    const available = !conflictingBooking;

    res.json({ 
      available, 
      reason: available ? null : 'Dates already booked',
      pricePerNight: listing.pricePerNight,
      maxGuests: listing.maxGuests
    });

  } catch (err) {
    console.error('❌ Error checking availability:', err);
    res.status(500).json({ 
      error: 'Failed to check availability',
      details: err.message 
    });
  }
});

module.exports = router;