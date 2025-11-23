// backend/middleware/auth.js
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized - Please login" });
}

function ensureOwner(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'owner') {
    return next();
  }
  return res.status(403).json({ error: "Forbidden - Owner access only" });
}

function ensureTraveler(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'traveler') {
    return next();
  }
  return res.status(403).json({ error: "Forbidden - Traveler access only" });
}

module.exports = { ensureAuth, ensureOwner, ensureTraveler };