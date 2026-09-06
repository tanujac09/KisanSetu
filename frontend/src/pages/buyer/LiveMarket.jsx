import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import AuctionCard from '../../components/AuctionCard.jsx';
import api from '../../services/api.js';
import { getSocket } from '../../services/socket.js';

const CROP_FILTERS = ['All', 'Wheat', 'Rice', 'Soybean', 'Maize', 'Moong', 'Cotton'];

export default function BuyerLiveMarket() {
  const [auctions, setAuctions] = useState([]);
  const [cropFilter, setCropFilter] = useState('All');

  function loadAuctions() {
    api.get('/market/auctions', { params: { status: 'LIVE' } }).then(({ data }) => setAuctions(data.auctions));
  }

  useEffect(() => {
    loadAuctions();
    const socket = getSocket();
    socket.on('bidUpdate', loadAuctions);
    socket.on('auctionCreated', loadAuctions);
    socket.on('auctionEnded', loadAuctions);
    socket.on('auctionFinalized', loadAuctions);
    return () => {
      socket.off('bidUpdate', loadAuctions);
      socket.off('auctionCreated', loadAuctions);
      socket.off('auctionEnded', loadAuctions);
      socket.off('auctionFinalized', loadAuctions);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    auctions.forEach((a) => socket.emit('joinAuction', a.id));
  }, [auctions]);

  async function handleBid(auctionId, amount) {
    await api.post(`/market/auctions/${auctionId}/bid`, { amount });
    loadAuctions();
  }

  const visible = cropFilter === 'All' ? auctions : auctions.filter((a) => a.crop === cropFilter);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Live Market Trade</h1>
      <p className="text-field-dark/60 text-sm mb-6">Real-time mandi commodity auctions - bid directly on live listings.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {CROP_FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCropFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-pill font-medium ${cropFilter === c ? 'bg-mandi text-white' : 'bg-mandi/10 text-mandi'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="panel p-6 text-sm text-field-dark/50">No live auctions match this filter right now.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((a) => (
            <AuctionCard key={a.id} auction={a} canBid onBid={(amount) => handleBid(a.id, amount)} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
