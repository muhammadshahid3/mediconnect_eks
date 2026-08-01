import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineBriefcase, HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker } from 'react-icons/hi';
import { getDoctorById } from '../services/doctorService';
import { bookAppointment } from '../services/appointmentService';
import { UPLOADS_BASE_URL } from '../services/api';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

const initials = (name = '') =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const DoctorProfileView = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ appointmentDate: '', appointmentTime: '', notes: '' });
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const { data } = await getDoctorById(id);
        setDoctor(data);
      } catch (err) {
        setError('This doctor profile could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBook = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info('Please log in as a patient to book an appointment.');
      navigate('/patient/login');
      return;
    }
    if (role !== 'patient') {
      toast.error('Only patients can book appointments.');
      return;
    }

    setBooking(true);
    try {
      const { data } = await bookAppointment({ doctorId: id, ...form });
      toast.success(data.message);
      setBooked(true);
      setForm({ appointmentDate: '', appointmentTime: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not book this appointment.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Loader label="Loading doctor profile…" />;

  if (error || !doctor) {
    return (
      <div className="section py-20 text-center">
        <p className="text-teal-700 font-medium">{error}</p>
      </div>
    );
  }

  const imageUrl = doctor.profileImage ? `${UPLOADS_BASE_URL}${doctor.profileImage}` : null;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="section py-12 grid lg:grid-cols-3 gap-8">
      {/* Profile */}
      <div className="lg:col-span-2 card p-8">
        <div className="flex items-start gap-5 flex-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt={doctor.fullName} className="w-24 h-24 rounded-full object-cover border-2 border-teal-100" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-teal-100 text-teal-700 font-display font-bold flex items-center justify-center text-2xl border-2 border-teal-100">
              {initials(doctor.fullName)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-ink font-display">Dr. {doctor.fullName}</h1>
            <p className="text-clay-600 font-semibold">{doctor.specialization || 'General Physician'}</p>
            {doctor.qualification && <p className="text-sm text-teal-600">{doctor.qualification}</p>}
          </div>
        </div>

        {doctor.about && (
          <div className="mt-6">
            <h2 className="font-display font-bold text-ink mb-2">About</h2>
            <p className="text-sm text-teal-800 leading-relaxed">{doctor.about}</p>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm text-teal-800">
          <span className="flex items-center gap-2">
            <HiOutlineBriefcase className="text-teal-500" />
            {doctor.experience ? `${doctor.experience} years experience` : 'Experience not listed'}
          </span>
          <span className="flex items-center gap-2">
            <HiOutlineCurrencyDollar className="text-teal-500" />
            {doctor.consultationFee ? `$${doctor.consultationFee} consultation fee` : 'Fee on request'}
          </span>
          {doctor.availableDays?.length > 0 && (
            <span className="flex items-center gap-2">
              <HiOutlineCalendar className="text-teal-500" />
              {doctor.availableDays.join(', ')}
            </span>
          )}
          {doctor.availableTime && (
            <span className="flex items-center gap-2">
              <HiOutlineClock className="text-teal-500" />
              {doctor.availableTime}
            </span>
          )}
          {doctor.clinicAddress && (
            <span className="flex items-center gap-2 sm:col-span-2">
              <HiOutlineLocationMarker className="text-teal-500" />
              {doctor.clinicAddress}
            </span>
          )}
        </div>
      </div>

      {/* Booking */}
      <div id="book" className="card p-8 h-fit sticky top-24">
        <h2 className="font-display font-bold text-ink mb-1">Book Appointment</h2>
        <p className="text-sm text-teal-500 mb-5">Pick a date and time that works for you.</p>

        {booked ? (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 text-center">
            <p className="font-semibold text-teal-800">Your appointment has been booked successfully.</p>
            <p className="text-sm text-teal-600 mt-2">You can track its status from your patient dashboard.</p>
            <button onClick={() => navigate('/patient/dashboard')} className="btn-primary w-full mt-4">
              Go to My Bookings
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="label">Appointment Date</label>
              <input type="date" name="appointmentDate" required min={today} className="input" value={form.appointmentDate} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Appointment Time</label>
              <input type="time" name="appointmentTime" required className="input" value={form.appointmentTime} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Patient Notes (Optional)</label>
              <textarea name="notes" rows={3} className="input" value={form.notes} onChange={handleChange} placeholder="Briefly describe your reason for visit…" />
            </div>
            <button type="submit" disabled={booking} className="btn-accent w-full">
              {booking ? 'Booking…' : 'Book Appointment'}
            </button>
            {!user && (
              <p className="text-xs text-teal-500 text-center">You'll be asked to log in as a patient first.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileView;
