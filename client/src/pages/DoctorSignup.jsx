import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorSignup } from '../services/authService';
import useAuth from '../hooks/useAuth';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  specialization: '',
  qualification: '',
  experience: '',
};

const DoctorSignup = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await doctorSignup(form);
      login(data.token, { ...data.user, role: 'doctor' });
      toast.success('Welcome to MediConnect! Your doctor account is ready.');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section py-16 max-w-lg mx-auto">
      <div className="card p-8">
        <span className="eyebrow">Doctor</span>
        <h1 className="text-2xl font-extrabold text-ink mt-1 mb-6">Create your doctor account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="fullName" required className="input" value={form.fullName} onChange={handleChange} placeholder="Dr. Jane Smith" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} placeholder="jane@clinic.com" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" required className="input" value={form.phone} onChange={handleChange} placeholder="+1 555 000 1234" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" name="password" required minLength={6} className="input" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Specialization</label>
              <input name="specialization" className="input" value={form.specialization} onChange={handleChange} placeholder="Cardiology" />
            </div>
            <div>
              <label className="label">Qualification</label>
              <input name="qualification" className="input" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD" />
            </div>
          </div>
          <div>
            <label className="label">Years of Experience</label>
            <input type="number" min="0" name="experience" className="input" value={form.experience} onChange={handleChange} placeholder="8" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-teal-700 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/doctor/login" className="font-semibold text-clay-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorSignup;
