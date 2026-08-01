const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * Verifies the Bearer token and attaches `req.user` and `req.userRole`.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      if (decoded.role === 'doctor') {
        user = await Doctor.findById(decoded.id);
      } else if (decoded.role === 'patient') {
        user = await Patient.findById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Restricts a route to specific roles. Use after `protect`.
 * Example: router.put('/profile', protect, authorize('doctor'), updateProfile)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Role '${req.userRole}' is not allowed to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
