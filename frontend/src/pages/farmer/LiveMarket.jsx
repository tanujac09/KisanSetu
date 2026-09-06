import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import AuctionCard from '../../components/AuctionCard.jsx';
import api from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FarmerLiveMarket() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [productId, setProductId] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loadAuctions() {
    api.get('/market/auctions').then(({ data }) => {
      setAuctions(data.auctions.filter((a) => a.farmerId === user.id));
    });
  }

  useEffect(() => {
    api.get('/farmer/products').then(({ data }) => setProducts(data.products.filter((p) => p.status === 'AVAILABLE')));
    loadAuctions();

    const socket = getSocket();
    auctions.forEach((a) => socket.emit('joinAuction', a.id));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = getSocket();
    auctions.forEach((a) => socket.emit('joinAuction', a.id));
  }, [auctions]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!productId || !startingPrice || !durationMinutes) return;
    setLoading(true);
    try {
      await api.post('/market/auctions', { productId, startingPrice, durationMinutes });
      setProductId(''); setStartingPrice('');
      loadAuctions();
      api.get('/farmer/products').then(({ data }) => setProducts(data.products.filter((p) => p.status === 'AVAILABLE')));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the auction.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalize(auctionId) {
    await api.post(`/market/auctions/${auctionId}/finalize`);
    loadAuctions();
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Live Market Trade</h1>
      <p className="text-field-dark/60 text-sm mb-6">Put a listing up for real-time bidding and finalize when you're happy with the price.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleCreate} className="panel p-6 space-y-4 h-fit">
          <h2 className="font-display text-lg text-field-dark">Start a new auction</h2>
          <div>
            <label className="label">Produce to auction</label>
            <select className="input-field" required value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select a listing</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.crop} - {p.quantity} quintal</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Starting price (₹/quintal)</label>
              <input className="input-field" type="number" min="1" required value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <select className="input-field" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}>
                <option value="5">5</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          {products.length === 0 && <p className="text-sm text-field-dark/50">No available listings to auction - post produce first.</p>}
          <button type="submit" disabled={loading || products.length === 0} className="btn-accent w-full">
            {loading ? 'Starting...' : 'Start Auction'}
          </button>
        </form>

        <div>
          <h2 className="font-display text-lg text-field-dark mb-3">Your auctions</h2>
          {auctions.length === 0 ? (
            <p className="panel p-5 text-sm text-field-dark/50">No auctions running yet.</p>
          ) : (
            <div className="space-y-4">
              {auctions.map((a) => (
                <AuctionCard key={a.id} auction={a} isOwner canBid={false} onFinalize={() => handleFinalize(a.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
