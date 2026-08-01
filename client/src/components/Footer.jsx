import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-teal-900 text-teal-100 mt-24">
    <div className="section py-12 grid gap-10 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#F67C42" />
            <path
              d="M4 17h5l2-6 4 12 3-9 2 3h8"
              stroke="#0B2925"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display font-extrabold text-lg text-white">MediConnect</span>
        </div>
        <p className="text-sm text-teal-200/80 max-w-xs">
          Connecting patients with trusted doctors — book an appointment in minutes, from any device.
        </p>
      </div>

      <div>
        <h4 className="font-display font-semibold text-white mb-3">For Patients</h4>
        <ul className="space-y-2 text-sm text-teal-200/80">
          <li><Link to="/patient/signup" className="hover:text-clay-300">Create an account</Link></li>
          <li><Link to="/patient/login" className="hover:text-clay-300">Sign in</Link></li>
          <li><Link to="/#doctors" className="hover:text-clay-300">Browse doctors</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display font-semibold text-white mb-3">For Doctors</h4>
        <ul className="space-y-2 text-sm text-teal-200/80">
          <li><Link to="/doctor/signup" className="hover:text-clay-300">Join as a doctor</Link></li>
          <li><Link to="/doctor/login" className="hover:text-clay-300">Sign in</Link></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-teal-800/60">
      <div className="section py-5 text-xs text-teal-300/70 flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} MediConnect. All rights reserved.</span>
        <span>Built with the MERN stack.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
