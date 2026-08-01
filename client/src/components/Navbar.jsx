import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 shrink-0">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#175349" />
      <path
        d="M4 17h5l2-6 4 12 3-9 2 3h8"
        stroke="#F67C42"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-display font-extrabold text-lg text-teal-900">MediConnect</span>
  </Link>
);

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const dashboardPath = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-mist/90 backdrop-blur border-b border-teal-100">
      <nav className="section flex items-center justify-between h-16">
        <Logo />

        <div className="hidden md:flex items-center gap-2">
          {!user && (
            <>
              <Link to="/#doctors" className="btn-ghost !px-4">
                Find Doctors
              </Link>
              <Link to="/doctor/login" className="btn-outline !px-4">
                Doctor Login
              </Link>
              <Link to="/patient/login" className="btn-accent !px-4">
                Patient Login
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="text-sm text-teal-700 mr-1">
                Hi, <span className="font-semibold">{user.fullName?.split(' ')[0]}</span>
              </span>
              <Link to={dashboardPath} className="btn-outline !px-4">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-primary !px-4">
                Logout
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-teal-800 text-2xl"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden section pb-4 flex flex-col gap-2">
          {!user && (
            <>
              <Link to="/#doctors" onClick={() => setOpen(false)} className="btn-ghost w-full">
                Find Doctors
              </Link>
              <Link to="/doctor/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                Doctor Login
              </Link>
              <Link to="/patient/login" onClick={() => setOpen(false)} className="btn-accent w-full">
                Patient Login
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="btn-outline w-full">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-primary w-full">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
