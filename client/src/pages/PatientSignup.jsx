import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientSignup } from '../services/authService';
import useAuth from '../hooks/useAuth';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const PatientSignup = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await patientSignup(form);
      login(data.token, { ...data.user, role: 'patient' });
      toast.success('Account created! Welcome to MediConnect.');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section py-16 max-w-lg mx-auto">
      <div className="card p-8">
        <span className="eyebrow">Patient</span>
        <h1 className="text-2xl font-extrabold text-ink mt-1 mb-6">Create your account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="fullName" required className="input" value={form.fullName} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} placeholder="john@email.com" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" required className="input" value={form.phone} onChange={handleChange} placeholder="+1 555 000 1234" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" required minLength={6} className="input" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" required minLength={6} className="input" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-teal-700 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/patient/login" className="font-semibold text-clay-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientSignup;
