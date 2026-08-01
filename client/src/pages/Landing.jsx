import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineClock, HiOutlineUserGroup } from 'react-icons/hi';
import { getDoctors } from '../services/doctorService';
import DoctorCard from '../components/DoctorCard';
import PulseDivider from '../components/PulseDivider';
import Loader from '../components/Loader';

const Landing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchDoctors = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getDoctors(query ? { search: query } : {});
      setDoctors(data);
    } catch (err) {
      setError('We could not load doctors right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-teal-800">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden="true">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 L0 0 0 40" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="section relative py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow text-clay-300">Care, coordinated</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Find the right doctor. Book in minutes.
            </h1>
            <p className="mt-5 text-teal-100/90 text-lg max-w-lg">
              MediConnect matches you with verified, experienced doctors across specializations —
              then handles the scheduling, so you can focus on getting well.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or specialization"
                  className="w-full rounded-full pl-11 pr-4 py-3 text-sm border-0 focus:ring-2 focus:ring-clay-400 outline-none"
                />
              </div>
              <button type="submit" className="btn-accent">
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/doctor/login" className="btn-outline !border-white !text-white hover:!bg-white/10">
                Doctor Login
              </Link>
              <Link to="/patient/login" className="btn-accent">
                Patient Login
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="card !bg-white/95 p-6 max-w-sm ml-auto">
              <p className="eyebrow text-clay-500">Next available</p>
              <h3 className="font-display font-bold text-xl mt-1 text-ink">Dr. Amara Osei</h3>
              <p className="text-sm text-clay-600 font-medium">Cardiologist</p>
              <div className="mt-4 pt-4 border-t border-teal-100 flex items-center justify-between text-sm">
                <span className="text-teal-700">Today, 4:30 PM</span>
                <span className="font-semibold text-teal-800">$60 consult</span>
              </div>
            </div>
          </div>
        </div>

        <PulseDivider color="#F2994A" />
      </section>

      {/* ABOUT */}
      <section className="section py-20 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <HiOutlineShieldCheck className="text-2xl" />,
            title: 'Verified doctors',
            body: 'Every doctor profile includes real qualifications, specialization, and experience — no guesswork.',
          },
          {
            icon: <HiOutlineClock className="text-2xl" />,
            title: 'Book in minutes',
            body: 'Pick a date and time from a doctor’s real availability and confirm instantly, no phone calls.',
          },
          {
            icon: <HiOutlineUserGroup className="text-2xl" />,
            title: 'Built for both sides',
            body: 'Doctors manage their practice and requests from one dashboard; patients track every visit.',
          },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="font-display font-bold text-ink mb-2">{item.title}</h3>
            <p className="text-sm text-teal-700/90 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* FEATURED DOCTORS */}
      <section id="doctors" className="section pb-24">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="eyebrow">Directory</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-1">
              {search ? `Results for "${search}"` : 'Featured Doctors'}
            </h2>
          </div>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                fetchDoctors();
              }}
              className="btn-ghost !px-4"
            >
              Clear search
            </button>
          )}
        </div>

        {loading && <Loader label="Finding doctors…" />}

        {!loading && error && (
          <div className="card p-6 text-center text-clay-700 bg-clay-50 border-clay-200">{error}</div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-teal-700 font-medium">No doctors found yet.</p>
            <p className="text-sm text-teal-500 mt-1">
              Try a different search term, or check back soon as doctors join MediConnect.
            </p>
          </div>
        )}

        {!loading && !error && doctors.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} showBookButton />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Landing;
