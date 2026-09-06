import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BuyerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('otp'); // 'otp' | 'password'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function goDashboard(data) {
    login(data.user, data.token);
    navigate('/buyer/dashboard');
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/buyer/otp/request', { mobile });
      setOtpSent(true);
      setDevOtp(data.devOtp || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/buyer/otp/verify', { mobile, otp });
      goDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/buyer/login', { mobile, password });
      goDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] px-4">
      <div className="panel p-8 w-full max-w-md">
        <p className="font-display text-2xl text-field-dark mb-1">Buyer / Trader Login</p>
        <p className="text-sm text-field-dark/50 mb-6">Streamlined access for commercial buyers and traders.</p>

        <div className="flex gap-2 mb-5 text-xs">
          <button onClick={() => { setMode('otp'); setError(''); }} className={`px-3 py-1.5 rounded-pill font-medium ${mode === 'otp' ? 'bg-mandi text-white' : 'bg-mandi/10 text-mandi'}`}>OTP Login</button>
          <button onClick={() => { setMode('password'); setError(''); }} className={`px-3 py-1.5 rounded-pill font-medium ${mode === 'password' ? 'bg-mandi text-white' : 'bg-mandi/10 text-mandi'}`}>Password Login</button>
        </div>

        {mode === 'otp' ? (
          !otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="label">Mobile number</label>
                <input className="input-field" required maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} placeholder="10 digit mobile" />
              </div>
              {error && <p className="text-sm text-alert">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full bg-mandi hover:bg-mandi-dark">{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="label">Enter OTP sent to {mobile}</label>
                <input className="input-field" required maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="4 digit OTP" />
                {devOtp && <p className="text-xs text-harvest-dark mt-1">Demo mode - your OTP is {devOtp}</p>}
              </div>
              {error && <p className="text-sm text-alert">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full bg-mandi hover:bg-mandi-dark">{loading ? 'Verifying...' : 'Verify & Log in'}</button>
              <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-field-dark/50 hover:underline w-full text-center">Change mobile number</button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="label">Mobile number</label>
              <input className="input-field" required maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input-field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-alert">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full bg-mandi hover:bg-mandi-dark">{loading ? 'Logging in...' : 'Log in'}</button>
          </form>
        )}

        <p className="text-sm text-field-dark/50 mt-5 text-center">
          New here? <Link to="/buyer/register" className="text-mandi hover:underline">Register as a buyer</Link>
        </p>
        <p className="text-xs text-field-dark/40 mt-2 text-center"><Link to="/" className="hover:underline">Back to role selection</Link></p>
      </div>
    </div>
  );
}
