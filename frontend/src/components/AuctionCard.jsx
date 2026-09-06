import { useEffect, useState } from 'react';

function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(endsAt).getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return { remaining, label: `${mm}:${ss}` };
}

const STATUS_STYLE = {
  LIVE: 'bg-field/10 text-field',
  ENDED: 'bg-harvest/20 text-harvest-dark',
  FINALIZED: 'bg-soil/10 text-soil'
};

export default function AuctionCard({ auction, isOwner = false, canBid = false, onFinalize, onBid }) {
  const { remaining, label } = useCountdown(auction.endsAt);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLive = auction.status === 'LIVE' && remaining > 0;
  const minNext = auction.currentBid ? auction.currentBid + 1 : auction.startingPrice;

  async function handleBid(e) {
    e.preventDefault();
    setError('');
    if (!bidAmount || Number(bidAmount) < minNext) {
      setError(`Bid must be at least \u20b9${minNext}.`);
      return;
    }
    setBusy(true);
    try {
      await onBid?.(Number(bidAmount));
      setBidAmount('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not place bid.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-field-dark">{auction.crop} &middot; {auction.quantity} qtl</p>
          <p className="text-xs text-field-dark/50">Starting \u20b9{auction.startingPrice}/qtl</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-pill font-medium ${STATUS_STYLE[auction.status] || ''}`}>{auction.status}</span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-field-dark/40 uppercase tracking-wide">Current bid</p>
          <p className="font-display text-xl text-field-dark">{auction.currentBid ? `\u20b9${auction.currentBid}` : 'No bids yet'}</p>
          {auction.currentBidderName && <p className="text-xs text-field-dark/50">by {auction.currentBidderName}</p>}
        </div>
        {isLive && (
          <div className="text-right">
            <p className="text-[11px] text-field-dark/40 uppercase tracking-wide">Time left</p>
            <p className="font-mono text-lg text-alert">{label}</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-field-dark/40 mt-2">{auction.bids.length} bid{auction.bids.length === 1 ? '' : 's'} placed</p>

      {canBid && isLive && (
        <form onSubmit={handleBid} className="flex gap-2 mt-3">
          <input
            className="input-field"
            type="number"
            min={minNext}
            placeholder={`\u20b9${minNext} or more`}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <button type="submit" disabled={busy} className="btn-accent text-sm py-2 px-4 whitespace-nowrap">
            {busy ? 'Placing...' : 'Place Bid'}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-alert mt-2">{error}</p>}

      {isOwner && (auction.status === 'ENDED' || (isLive && auction.currentBid)) && (
        <button onClick={onFinalize} className="btn-primary text-sm py-2 px-4 mt-3 w-full">
          Finalize Deal
        </button>
      )}
      {isOwner && auction.status === 'FINALIZED' && (
        <p className="text-xs text-field font-medium mt-3">Finalized at \u20b9{auction.finalPrice}/qtl</p>
      )}
    </div>
  );
}
