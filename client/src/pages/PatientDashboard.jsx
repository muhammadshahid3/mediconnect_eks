import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';
import { getDoctors } from '../services/doctorService';
import { getPatientAppointments } from '../services/appointmentService';
import { getPatientProfile, updatePatientProfile } from '../services/patientService';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-teal-100 text-teal-700',
  completed: 'bg-teal-700 text-white',
  cancelled: 'bg-rose-100 text-rose-700',
};

const PatientDashboard = () => {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('search');

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [docLoading, setDocLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchDoctors = async (query = '') => {
    setDocLoading(true);
    try {
      const { data } = await getDoctors(query ? { search: query } : {});
      setDoctors(data);
    } catch (err) {
      toast.error('Could not load doctors.');
    } finally {
      setDocLoading(false);
    }
  };

  const loadAppointments = async () => {
    setApptLoading(true);
    try {
      const { data } = await getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Could not load your appointments.');
    } finally {
      setApptLoading(false);
    }
  };

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const { data } = await getPatientProfile();
      setProfile(data);
    } catch (err) {
      toast.error('Could not load your profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    searchDoctors();
  }, []);

  useEffect(() => {
    if (tab === 'bookings') loadAppointments();
    if (tab === 'profile') loadProfile();
  }, [tab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchDoctors(search);
  };

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updatePatientProfile({ fullName: profile.fullName, phone: profile.phone });
      updateUser({ fullName: data.fullName });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section py-12">
      <div className="mb-8">
        <span className="eyebrow">Patient Dashboard</span>
        <h1 className="text-3xl font-extrabold text-ink mt-1">Welcome back</h1>
      </div>

      <div className="flex gap-2 mb-8 border-b border-teal-100 overflow-x-auto">
        <button
          onClick={() => setTab('search')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            tab === 'search' ? 'border-clay-500 text-clay-600' : 'border-transparent text-teal-500 hover:text-teal-700'
          }`}
        >
          <HiOutlineSearch /> Search Doctors
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            tab === 'bookings' ? 'border-clay-500 text-clay-600' : 'border-transparent text-teal-500 hover:text-teal-700'
          }`}
        >
          <HiOutlineCalendar /> My Bookings
        </button>
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            tab === 'profile' ? 'border-clay-500 text-clay-600' : 'border-transparent text-teal-500 hover:text-teal-700'
          }`}
        >
          <HiOutlineUser /> Edit Profile
        </button>
      </div>

      {tab === 'search' && (
        <div>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mb-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              placeholder="Search by name or specialization"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>

          {docLoading && <Loader label="Finding doctors…" />}
          {!docLoading && doctors.length === 0 && (
            <div className="card p-10 text-center">
              <p className="text-teal-700 font-medium">No doctors match your search.</p>
            </div>
          )}
          {!docLoading && doctors.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} showBookButton />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          {apptLoading && <Loader label="Loading your appointments…" />}
          {!apptLoading && appointments.length === 0 && (
            <div className="card p-10 text-center">
              <p className="text-teal-700 font-medium">You have no appointments yet.</p>
              <p className="text-sm text-teal-500 mt-1">Search for a doctor and book your first visit.</p>
            </div>
          )}
          {!apptLoading && appointments.length > 0 && (
            <div className="grid gap-4">
              {appointments.map((appt) => (
                <div key={appt._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-display font-bold text-ink">Dr. {appt.doctorId?.fullName}</p>
                    <p className="text-sm text-clay-600 font-medium">{appt.doctorId?.specialization}</p>
                    <p className="text-sm text-teal-800 mt-1">
                      {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                    </p>
                    {appt.notes && <p className="text-sm text-teal-500 mt-1 italic">“{appt.notes}”</p>}
                  </div>
                  <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <>
          {profileLoading && <Loader label="Loading your profile…" />}
          {!profileLoading && profile && (
            <form onSubmit={handleProfileSave} className="card p-8 max-w-lg">
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input name="fullName" className="input" value={profile.fullName || ''} onChange={handleProfileChange} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input bg-teal-50 text-teal-500" value={profile.email || ''} disabled />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input name="phone" className="input" value={profile.phone || ''} onChange={handleProfileChange} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-accent mt-6">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default PatientDashboard;
