import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { CROPS } from '../../utils/states.js';

const emptyForm = { crop: '', variety: '', quantity: '', expectedPrice: '', harvestDate: '', description: '' };

export default function PostSell() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function loadProducts() {
    api.get('/farmer/products').then(({ data }) => setProducts(data.products));
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/farmer/products', {
        ...form,
        state: user.state,
        district: user.district
      });
      setForm(emptyForm);
      setSuccess('Produce listed successfully. Buyers matching your crop will now see it.');
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the listing.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/farmer/products/${id}`);
    loadProducts();
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Post (Sell)</h1>
      <p className="text-field-dark/60 text-sm mb-6">List your produce so verified buyers can find and bid on it.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="panel p-6 space-y-4 h-fit">
          <div>
            <label className="label">Crop</label>
            <select className="input-field" required value={form.crop} onChange={(e) => update('crop', e.target.value)}>
              <option value="">Select crop</option>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Variety (optional)</label>
            <input className="input-field" value={form.variety} onChange={(e) => update('variety', e.target.value)} placeholder="e.g. Lokwan, Sharbati" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity (quintals)</label>
              <input className="input-field" type="number" min="1" required value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
            </div>
            <div>
              <label className="label">Expected price (₹/quintal)</label>
              <input className="input-field" type="number" min="1" required value={form.expectedPrice} onChange={(e) => update('expectedPrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Harvest date (optional)</label>
            <input className="input-field" type="date" value={form.harvestDate} onChange={(e) => update('harvestDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Quality notes, moisture %, storage conditions..." />
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          {success && <p className="text-sm text-field">{success}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Posting...' : 'Post Produce'}</button>
        </form>

        <div>
          <h2 className="font-display text-lg text-field-dark mb-3">Your active listings</h2>
          <div className="space-y-3">
            {products.length === 0 && <p className="panel p-5 text-sm text-field-dark/50">No listings yet.</p>}
            {products.map((p) => (
              <div key={p.id} className="panel p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.crop} {p.variety ? `· ${p.variety}` : ''}</p>
                  <p className="text-xs text-field-dark/50">{p.quantity} quintal @ ₹{p.expectedPrice}/quintal</p>
                  <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded-pill bg-field/10 text-field">{p.status}</span>
                </div>
                {p.status === 'AVAILABLE' && (
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-alert hover:underline">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
