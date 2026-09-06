import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FarmerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ aadhaar: '', mobile: '', dob: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/farmer/login', form);
      login(data.user, data.token);
      navigate('/farmer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] px-4">
      <div className="panel p-8 w-full max-w-md">
        <p className="font-display text-2xl text-field-dark mb-1">Farmer Login</p>
        <p className="text-sm text-field-dark/50 mb-6">Verify your identity with your registered Aadhaar, mobile and date of birth.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Aadhaar number</label>
            <input className="input-field" required maxLength={12} pattern="\d{12}" value={form.aadhaar} onChange={(e) => update('aadhaar', e.target.value.replace(/\D/g, ''))} placeholder="12 digit Aadhaar" />
          </div>
          <div>
            <label className="label">Mobile number</label>
            <input className="input-field" required maxLength={10} pattern="\d{10}" value={form.mobile} onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))} placeholder="10 digit mobile" />
          </div>
          <div>
            <label className="label">Date of birth</label>
            <input className="input-field" type="date" required value={form.dob} onChange={(e) => update('dob', e.target.value)} />
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying...' : 'Log in'}</button>
        </form>
        <p className="text-sm text-field-dark/50 mt-5 text-center">
          New here? <Link to="/farmer/register" className="text-field hover:underline">Register as a farmer</Link>
        </p>
        <p className="text-xs text-field-dark/40 mt-2 text-center"><Link to="/" className="hover:underline">Back to role selection</Link></p>
      </div>
    </div>
  );
}
