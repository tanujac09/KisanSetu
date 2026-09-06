import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import MatchCard from '../../components/MatchCard.jsx';
import api from '../../services/api.js';

export default function BuyerMatchFound() {
  const [requirements, setRequirements] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/buyer/requirements').then(({ data }) => {
      const open = data.requirements.filter((r) => r.status === 'OPEN');
      setRequirements(open);
      if (open.length > 0) setSelectedId(open[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) { setMatches([]); return; }
    setLoading(true);
    api.get(`/buyer/requirements/${selectedId}/matches`)
      .then(({ data }) => setMatches(data.matches))
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Match Found</h1>
      <p className="text-field-dark/60 text-sm mb-6">Farmers ranked by the best projected value for your requirement - quality, quantity fit and logistics all factored in.</p>

      {requirements.length === 0 ? (
        <p className="panel p-6 text-sm text-field-dark/50">You have no open requirements. Post one first to see matches.</p>
      ) : (
        <>
          <div className="mb-6 max-w-sm">
            <label className="label">Choose a requirement</label>
            <select className="input-field" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>{r.crop} - {r.quantity} quintal @ up to ₹{r.maxPrice}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-field-dark/50">Finding matches...</p>
          ) : matches.length === 0 ? (
            <p className="panel p-6 text-sm text-field-dark/50">No matching farmer listings for this crop yet. Check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {matches.map((m) => (
                <MatchCard
                  key={m.productId}
                  counterpartLabel="Matched Farmer"
                  counterpartName={m.farmerName}
                  verified={m.verified}
                  rating={m.farmerRating}
                  crop={m.crop}
                  quantity={m.farmerQuantity}
                  offerPrice={m.farmerAskPrice}
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
