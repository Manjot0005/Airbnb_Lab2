// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { User } = require('../models');
const { ensureAuth } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

// GET /api/profile
router.get('/', ensureAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PUT /api/profile
router.put('/', ensureAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone, city, country, bio, aboutMe, languages, gender } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (country) updateData.country = country;
    if (bio) updateData.bio = bio;
    
    if (req.file) {
      updateData.profileImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await User.update(updateData, { where: { id: req.session.user.id } });
    
    const updatedUser = await User.findByPk(req.session.user.id, {
      attributes: { exclude: ['password'] }
    });

    req.session.user = {
      ...req.session.user,
      name: updatedUser.name
    };

    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;