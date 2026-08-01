const express = require('express');
const router = express.Router();
const {
  signupPatient,
  loginPatient,
  getPatientProfile,
  updatePatientProfile,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.post('/signup', signupPatient);
router.post('/login', loginPatient);

// Private (patient)
router.get('/profile', protect, authorize('patient'), getPatientProfile);
router.put('/profile', protect, authorize('patient'), updatePatientProfile);

module.exports = router;
