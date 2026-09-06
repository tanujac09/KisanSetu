import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import MatchCard from '../../components/MatchCard.jsx';
import api from '../../services/api.js';

export default function FarmerMatchFound() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/farmer/products').then(({ data }) => {
      const available = data.products.filter((p) => p.status === 'AVAILABLE');
      setProducts(available);
      if (available.length > 0) setSelectedId(available[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) { setMatches([]); return; }
    setLoading(true);
    api.get(`/farmer/products/${selectedId}/matches`)
      .then(({ data }) => setMatches(data.matches))
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Match Found</h1>
      <p className="text-field-dark/60 text-sm mb-6">Buyers ranked by the highest projected in-hand price for your produce, not just the highest headline offer.</p>

      {products.length === 0 ? (
        <p className="panel p-6 text-sm text-field-dark/50">You have no active listings. Post produce first to see matches.</p>
      ) : (
        <>
          <div className="mb-6 max-w-sm">
            <label className="label">Choose a listing</label>
            <select className="input-field" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.crop} - {p.quantity} quintal @ ₹{p.expectedPrice}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-field-dark/50">Finding matches...</p>
          ) : matches.length === 0 ? (
            <p className="panel p-6 text-sm text-field-dark/50">No matching buyer requirements for this crop yet. Check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {matches.map((m) => (
                <MatchCard
                  key={m.requirementId}
                  counterpartLabel="Matched Buyer"
                  counterpartName={m.buyerName}
                  verified={m.verified}
                  rating={m.buyerRating}
                  crop={m.crop}
                  quantity={m.buyerQuantity}
                  offerPrice={m.buyerOfferPrice}
                  match={m}
                />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
