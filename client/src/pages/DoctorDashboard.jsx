import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineUser, HiOutlineCalendar } from 'react-icons/hi';
import { getMyDoctorProfile, updateDoctorProfile } from '../services/doctorService';
import { getDoctorAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { UPLOADS_BASE_URL } from '../services/api';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-teal-100 text-teal-700',
  completed: 'bg-teal-700 text-white',
  cancelled: 'bg-rose-100 text-rose-700',
};

const DoctorDashboard = () => {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getMyDoctorProfile();
      setProfile({ ...data, availableDays: data.availableDays || [] });
    } catch (err) {
      toast.error('Could not load your profile.');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    setApptLoading(true);
    try {
      const { data } = await getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Could not load appointment requests.');
    } finally {
      setApptLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (tab === 'appointments') loadAppointments();
  }, [tab]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const toggleDay = (day) => {
    setProfile((prev) => {
      const days = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: days };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      ['fullName', 'phone', 'specialization', 'qualification', 'experience', 'clinicAddress', 'consultationFee', 'availableTime', 'about'].forEach(
        (field) => formData.append(field, profile[field] ?? '')
      );
      formData.append('availableDays', JSON.stringify(profile.availableDays || []));
      if (imageFile) formData.append('profileImage', imageFile);

      const { data } = await updateDoctorProfile(formData);
      setProfile((prev) => ({ ...prev, ...data }));
      updateUser({ fullName: data.fullName, profileImage: data.profileImage });
      toast.success('Profile updated successfully.');
      setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      toast.success(`Appointment marked as ${status}.`);
    } catch (err) {
      toast.error('Could not update appointment status.');
    }
  };

  if (loading) return <Loader label="Loading your dashboard…" />;
  if (!profile) return null;

  const imageUrl = preview || (profile.profileImage ? `${UPLOADS_BASE_URL}${profile.profileImage}` : null);

  return (
    <div className="section py-12">
      <div className="mb-8">
        <span className="eyebrow">Doctor Dashboard</span>
        <h1 className="text-3xl font-extrabold text-ink mt-1">Dr. {profile.fullName}</h1>
      </div>

      <div className="flex gap-2 mb-8 border-b border-teal-100">
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            tab === 'profile' ? 'border-clay-500 text-clay-600' : 'border-transparent text-teal-500 hover:text-teal-700'
          }`}
        >
          <HiOutlineUser /> My Profile
        </button>
        <button
          onClick={() => setTab('appointments')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            tab === 'appointments' ? 'border-clay-500 text-clay-600' : 'border-transparent text-teal-500 hover:text-teal-700'
          }`}
        >
          <HiOutlineCalendar /> Appointment Requests
          {appointments.filter((a) => a.status === 'pending').length > 0 && (
            <span className="ml-1 bg-clay-500 text-white text-xs px-2 py-0.5 rounded-full">
              {appointments.filter((a) => a.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSave} className="card p-8 max-w-3xl">
          <div className="flex items-center gap-5 mb-8">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-teal-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-700 font-display font-bold flex items-center justify-center text-xl border-2 border-teal-100">
                {profile.fullName?.[0]}
              </div>
            )}
            <div>
              <label className="label mb-1">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-teal-700" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Full Name</label>
              <input name="fullName" className="input" value={profile.fullName || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-teal-50 text-teal-500" value={profile.email || ''} disabled />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" className="input" value={profile.phone || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Specialization</label>
              <input name="specialization" className="input" value={profile.specialization || ''} onChange={handleChange} placeholder="Cardiology" />
            </div>
            <div>
              <label className="label">Qualification</label>
              <input name="qualification" className="input" value={profile.qualification || ''} onChange={handleChange} placeholder="MBBS, MD" />
            </div>
            <div>
              <label className="label">Years of Experience</label>
              <input type="number" min="0" name="experience" className="input" value={profile.experience ?? ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Consultation Fee ($)</label>
              <input type="number" min="0" name="consultationFee" className="input" value={profile.consultationFee ?? ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Available Time</label>
              <input name="availableTime" className="input" value={profile.availableTime || ''} onChange={handleChange} placeholder="9:00 AM - 5:00 PM" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Clinic Address</label>
              <input name="clinicAddress" className="input" value={profile.clinicAddress || ''} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">About</label>
              <textarea name="about" rows={4} className="input" value={profile.about || ''} onChange={handleChange} placeholder="Tell patients about your practice…" />
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    profile.availableDays?.includes(day)
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-teal-700 border-teal-200 hover:border-teal-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary mt-8">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      )}

      {tab === 'appointments' && (
        <div>
          {apptLoading && <Loader label="Loading appointment requests…" />}
          {!apptLoading && appointments.length === 0 && (
            <div className="card p-10 text-center">
              <p className="text-teal-700 font-medium">No appointment requests yet.</p>
              <p className="text-sm text-teal-500 mt-1">New bookings from patients will show up here.</p>
            </div>
          )}
          {!apptLoading && appointments.length > 0 && (
            <div className="grid gap-4">
              {appointments.map((appt) => (
                <div key={appt._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-display font-bold text-ink">{appt.patientId?.fullName}</p>
                    <p className="text-sm text-teal-600">{appt.patientId?.email} · {appt.patientId?.phone}</p>
                    <p className="text-sm text-teal-800 mt-1">
                      {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                    </p>
                    {appt.notes && <p className="text-sm text-teal-500 mt-1 italic">“{appt.notes}”</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[appt.status]}`}>
                      {appt.status}
                    </span>
                    {appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(appt._id, 'confirmed')} className="btn-primary !px-3 !py-1.5 text-xs">
                          Confirm
                        </button>
                        <button onClick={() => handleStatusChange(appt._id, 'cancelled')} className="btn-outline !px-3 !py-1.5 text-xs">
                          Decline
                        </button>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                      <button onClick={() => handleStatusChange(appt._id, 'completed')} className="btn-outline !px-3 !py-1.5 text-xs">
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
