const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (patient)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, notes } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Doctor, date and time are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user._id,
      appointmentDate,
      appointmentTime,
      notes: notes || '',
    });

    const populated = await appointment.populate([
      { path: 'doctorId', select: 'fullName specialization profileImage' },
      { path: 'patientId', select: 'fullName email phone' },
    ]);

    res.status(201).json({
      message: 'Your appointment has been booked successfully.',
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for the logged-in patient
// @route   GET /api/appointments/patient
// @access  Private (patient)
const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'fullName specialization profileImage clinicAddress consultationFee')
      .sort({ appointmentDate: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for the logged-in doctor
// @route   GET /api/appointments/doctor
// @access  Private (doctor)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'fullName email phone')
      .sort({ appointmentDate: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (doctor confirms/cancels/completes)
// @route   PUT /api/appointments/:id/status
// @access  Private (doctor)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};
