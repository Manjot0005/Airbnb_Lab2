const express = require('express');
const router = express.Router();
const Booking = require('../models-mongo/Booking');
const { publishBookingCreated, publishBookingAccepted } = require('../kafka/producer');

router.post('/', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    await publishBookingCreated(booking);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/accept', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'accepted' });
    await publishBookingAccepted(booking._id);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
