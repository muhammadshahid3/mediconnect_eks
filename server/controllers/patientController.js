const Patient = require('../models/Patient');
const generateToken = require('../utils/generateToken');

// @desc    Register new patient
// @route   POST /api/patients/signup
// @access  Public
const signupPatient = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'A patient account with this email already exists' });
    }

    const patient = await Patient.create({ fullName, email, phone, password });

    const token = generateToken(patient._id, 'patient');

    res.status(201).json({
      token,
      user: {
        id: patient._id,
        fullName: patient.fullName,
        email: patient.email,
        role: 'patient',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login patient
// @route   POST /api/patients/login
// @access  Public
const loginPatient = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient || !(await patient.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(patient._id, 'patient');

    res.status(200).json({
      token,
      user: {
        id: patient._id,
        fullName: patient.fullName,
        email: patient.email,
        role: 'patient',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in patient's profile
// @route   GET /api/patients/profile
// @access  Private (patient)
const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user._id);
    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (patient)
const updatePatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user._id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const { fullName, phone } = req.body;
    if (fullName !== undefined) patient.fullName = fullName;
    if (phone !== undefined) patient.phone = phone;

    const updatedPatient = await patient.save();

    res.status(200).json({
      id: updatedPatient._id,
      fullName: updatedPatient.fullName,
      email: updatedPatient.email,
      phone: updatedPatient.phone,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signupPatient,
  loginPatient,
  getPatientProfile,
  updatePatientProfile,
};
