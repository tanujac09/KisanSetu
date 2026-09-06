import { useState } from 'react';
import api from '../services/api.js';

export default function MatchCard({ counterpartLabel, counterpartName, verified, rating, crop, quantity, offerPrice, match }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handlePropose() {
    setBusy(true);
    setError('');
    try {
      await api.post('/transactions/propose', { productId: match.productId, requirementId: match.requirementId });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not propose the deal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-field-dark/40">{counterpartLabel}</p>
          <p className="font-medium text-field-dark">{counterpartName}</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {verified && <span className="px-2 py-0.5 rounded-pill bg-field/10 text-field font-medium">Verified</span>}
          <span className="text-harvest-dark">&#9733; {Number(rating).toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-field-dark/40">Crop</p>
          <p className="font-medium">{crop}</p>
        </div>
        <div>
          <p className="text-field-dark/40">Quantity</p>
          <p className="font-medium">{quantity} qtl</p>
        </div>
        <div>
          <p className="text-field-dark/40">Price/qtl</p>
          <p className="font-medium">\u20b9{offerPrice}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-field-dark/50 mb-1">
          <span>Match strength</span>
          <span>{match.matchPercentage}%</span>
        </div>
        <div className="h-1.5 rounded-pill bg-field/10 overflow-hidden">
          <div className="h-full bg-field rounded-pill" style={{ width: `${match.matchPercentage}%` }} />
        </div>
      </div>

      <p className="text-xs text-field-dark/50 mt-3">
        Net in-hand: <span className="font-medium text-field-dark">\u20b9{Math.round(match.netPayout).toLocaleString('en-IN')}</span> after \u20b9{match.transportCost} transport + \u20b9{match.commission} commission
      </p>

      {error && <p className="text-xs text-alert mt-2">{error}</p>}
      <button
        onClick={handlePropose}
        disabled={busy || done}
        className="btn-primary text-xs py-2 px-4 mt-3 w-full"
      >
        {done ? 'Deal proposed' : busy ? 'Proposing...' : 'Propose Deal'}
      </button>
    </div>
  );
}
