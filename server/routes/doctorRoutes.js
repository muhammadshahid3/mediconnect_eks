const express = require('express');
const router = express.Router();
const {
  signupDoctor,
  loginDoctor,
  getDoctors,
  getDoctorById,
  getMyProfile,
  updateDoctorProfile,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.post('/signup', signupDoctor);
router.post('/login', loginDoctor);
router.get('/', getDoctors);

// Private (doctor) - must come before /:id
router.get('/profile/me', protect, authorize('doctor'), getMyProfile);
router.put(
  '/profile',
  protect,
  authorize('doctor'),
  upload.single('profileImage'),
  updateDoctorProfile
);

// Public - dynamic id, keep last
router.get('/:id', getDoctorById);

module.exports = router;
