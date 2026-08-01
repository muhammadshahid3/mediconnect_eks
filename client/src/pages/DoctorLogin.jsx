import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorLogin } from '../services/authService';
import useAuth from '../hooks/useAuth';

const DoctorLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await doctorLogin(form);
      login(data.token, { ...data.user, role: 'doctor' });
      toast.success(`Welcome back, Dr. ${data.user.fullName.split(' ')[0]}!`);
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section py-20 max-w-md mx-auto">
      <div className="card p-8">
        <span className="eyebrow">Doctor shahid sahb</span>
        <h1 className="text-2xl font-extrabold text-ink mt-1 mb-6">Welcome back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} placeholder="jane@clinic.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" name="password" required className="input" value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-teal-700 mt-6 text-center">
          New to MediConnect?{' '}
          <Link to="/doctor/signup" className="font-semibold text-clay-600 hover:underline">
            Create a doctor account
          </Link>
        </p>
        <p className="text-xs text-teal-500 mt-3 text-center">
          Are you a patient?{' '}
          <Link to="/patient/login" className="underline hover:text-teal-700">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
