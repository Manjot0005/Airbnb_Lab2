// backend/routes/favorites.js - COMPLETE FAVORITES MANAGEMENT
const express = require('express');
const router = express.Router();
const { Favorite, Listing, User } = require('../models');
const { ensureAuth } = require('../middleware/auth');

// POST /favorites - Add property to favorites
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { listingId } = req.body;
    console.log('➕ Adding to favorites:', { userId: req.session.user.id, listingId });

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID required' });
    }

    // Check if listing exists
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      console.log('❌ Listing not found:', listingId);
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: {
        userId: req.session.user.id,
        listingId
      }
    });

    if (existing) {
      console.log('⚠️ Already in favorites');
      return res.status(400).json({ error: 'Already in favorites' });
    }

    // Create favorite
    const favorite = await Favorite.create({
      userId: req.session.user.id,
      listingId
    });

    console.log('✅ Added to favorites:', favorite.id);
    res.status(201).json({
      message: 'Added to favorites',
      favorite
    });
  } catch (err) {
    console.error('❌ Error adding favorite:', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// GET /favorites - Get user's favorites
router.get('/', ensureAuth, async (req, res) => {
  try {
    console.log('🔍 Fetching favorites for user:', req.session.user.id);
    
    const favorites = await Favorite.findAll({
      where: { userId: req.session.user.id },
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
          attributes: ['id', 'name', 'city', 'country']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Found favorites:', favorites.length);

    // Format response to match frontend expectations
    const formattedFavorites = favorites.map(fav => {
      const favData = fav.toJSON ? fav.toJSON() : fav;
      return {
        id: favData.id,
        userId: favData.userId,
        listingId: favData.listingId,
        createdAt: favData.createdAt,
        listing: favData.listing || favData.Listing // Handle both cases
      };
    });

    res.json({ 
      count: formattedFavorites.length,
      favorites: formattedFavorites
    });
  } catch (err) {
    console.error('❌ Error fetching favorites:', err);
    res.status(500).json({ error: 'Failed to load favorites' });
  }
});

// DELETE /favorites/:listingId - Remove from favorites
router.delete('/:listingId', ensureAuth, async (req, res) => {
  try {
    const { listingId } = req.params;
    console.log('🗑️ Removing from favorites:', { userId: req.session.user.id, listingId });

    const deleted = await Favorite.destroy({
      where: {
        userId: req.session.user.id,
        listingId
      }
    });

    if (deleted === 0) {
      console.log('⚠️ Favorite not found to delete');
      return res.status(404).json({ error: 'Favorite not found' });
    }

    console.log('✅ Removed from favorites');
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('❌ Error removing favorite:', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET /favorites/check/:listingId - Check if property is favorited
router.get('/check/:listingId', ensureAuth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        userId: req.session.user.id,
        listingId: req.params.listingId
      }
    });

    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error('❌ Error checking favorite:', err);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

module.exports = router;