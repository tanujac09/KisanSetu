import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { STATES, STATE_DISTRICTS } from '../../utils/states.js';

const empty = { businessName: '', mobile: '', password: '', state: '', district: '' };

export default function BuyerRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value, ...(field === 'state' ? { district: '' } : {}) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/buyer/register', form);
      login(data.user, data.token);
      navigate('/buyer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] px-4 py-10">
      <div className="panel p-8 w-full max-w-md">
        <p className="font-display text-2xl text-field-dark mb-1">Buyer / Trader Registration</p>
        <p className="text-sm text-field-dark/50 mb-6">Set a password now - you can still log in quickly with OTP later.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Business / trader name</label>
            <input className="input-field" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
          </div>
          <div>
            <label className="label">Mobile number</label>
            <input className="input-field" required maxLength={10} value={form.mobile} onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))} placeholder="10 digit mobile" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">State</label>
              <select className="input-field" required value={form.state} onChange={(e) => update('state', e.target.value)}>
                <option value="">Select</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">District</label>
              <select className="input-field" required disabled={!form.state} value={form.district} onChange={(e) => update('district', e.target.value)}>
                <option value="">Select</option>
                {(STATE_DISTRICTS[form.state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full bg-mandi hover:bg-mandi-dark">{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="text-sm text-field-dark/50 mt-5 text-center">
          Already registered? <Link to="/buyer/login" className="text-mandi hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
