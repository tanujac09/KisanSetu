import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import PriceIntelligenceWidget from '../../components/PriceIntelligenceWidget.jsx';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { CROPS } from '../../utils/states.js';

const emptyForm = { crop: '', quantity: '', maxPrice: '', deliveryDeadline: '', notes: '' };

export default function PostRequirement() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [requirements, setRequirements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function loadRequirements() {
    api.get('/buyer/requirements').then(({ data }) => setRequirements(data.requirements));
  }

  useEffect(() => { loadRequirements(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/buyer/requirements', {
        ...form,
        state: user.state,
        district: user.district
      });
      setForm(emptyForm);
      setSuccess('Requirement posted. Matching farmers will now see your demand.');
      loadRequirements();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post the requirement.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/buyer/requirements/${id}`);
    loadRequirements();
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Post Requirement</h1>
      <p className="text-field-dark/60 text-sm mb-6">Tell Kisan Setu what you need - we'll match you with farmers ranked by best value.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="panel p-6 space-y-4 h-fit">
          <div>
            <label className="label">Crop</label>
            <select className="input-field" required value={form.crop} onChange={(e) => update('crop', e.target.value)}>
              <option value="">Select crop</option>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity needed (quintals)</label>
              <input className="input-field" type="number" min="1" required value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
            </div>
            <div>
              <label className="label">Max price (₹/quintal)</label>
              <input className="input-field" type="number" min="1" required value={form.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Delivery deadline (optional)</label>
            <input className="input-field" type="date" value={form.deliveryDeadline} onChange={(e) => update('deliveryDeadline', e.target.value)} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Quality specs, certification needs..." />
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          {success && <p className="text-sm text-field">{success}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full bg-mandi hover:bg-mandi-dark">
            {loading ? 'Posting...' : 'Post Requirement'}
          </button>

          {form.crop && <PriceIntelligenceWidget crop={form.crop} />}
        </form>

        <div>
          <h2 className="font-display text-lg text-field-dark mb-3">Your open requirements</h2>
          <div className="space-y-3">
            {requirements.length === 0 && <p className="panel p-5 text-sm text-field-dark/50">No requirements posted yet.</p>}
            {requirements.map((r) => (
              <div key={r.id} className="panel p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.crop}</p>
                  <p className="text-xs text-field-dark/50">{r.quantity} quintal needed, up to ₹{r.maxPrice}/quintal</p>
                  <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded-pill bg-mandi/10 text-mandi">{r.status}</span>
                </div>
                {r.status === 'OPEN' && (
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-alert hover:underline">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
