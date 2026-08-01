const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');

// @desc    Register new doctor
// @route   POST /api/doctors/signup
// @access  Public
const signupDoctor = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, specialization, qualification, experience } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'A doctor account with this email already exists' });
    }

    const doctor = await Doctor.create({
      fullName,
      email,
      phone,
      password,
      specialization,
      qualification,
      experience,
    });

    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({
      token,
      user: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        role: 'doctor',
        profileImage: doctor.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login doctor
// @route   POST /api/doctors/login
// @access  Public
const loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor || !(await doctor.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(doctor._id, 'doctor');

    res.status(200).json({
      token,
      user: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        role: 'doctor',
        profileImage: doctor.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors (for landing page / search)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await Doctor.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by id
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in doctor's own profile
// @route   GET /api/doctors/profile/me
// @access  Private (doctor)
const getMyProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select('-password');
    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (doctor)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const fields = [
      'fullName',
      'phone',
      'specialization',
      'qualification',
      'experience',
      'clinicAddress',
      'consultationFee',
      'availableTime',
      'about',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    // availableDays may arrive as JSON string (multipart/form-data) or array
    if (req.body.availableDays !== undefined) {
      try {
        doctor.availableDays =
          typeof req.body.availableDays === 'string'
            ? JSON.parse(req.body.availableDays)
            : req.body.availableDays;
      } catch {
        doctor.availableDays = [req.body.availableDays];
      }
    }

    if (req.file) {
      doctor.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedDoctor = await doctor.save();

    res.status(200).json({
      id: updatedDoctor._id,
      fullName: updatedDoctor.fullName,
      email: updatedDoctor.email,
      phone: updatedDoctor.phone,
      profileImage: updatedDoctor.profileImage,
      specialization: updatedDoctor.specialization,
      qualification: updatedDoctor.qualification,
      experience: updatedDoctor.experience,
      clinicAddress: updatedDoctor.clinicAddress,
      consultationFee: updatedDoctor.consultationFee,
      availableDays: updatedDoctor.availableDays,
      availableTime: updatedDoctor.availableTime,
      about: updatedDoctor.about,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signupDoctor,
  loginDoctor,
  getDoctors,
  getDoctorById,
  getMyProfile,
  updateDoctorProfile,
};
