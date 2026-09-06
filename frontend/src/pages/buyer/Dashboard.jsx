import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import QuickNavCards from '../../components/QuickNavCards.jsx';
import WeatherWidget from '../../components/WeatherWidget.jsx';
import MatchCard from '../../components/MatchCard.jsx';
import AuctionCard from '../../components/AuctionCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

const CARDS = [
  { to: '/buyer/post', title: 'Post Requirement', subtitle: 'Buy / request produce', accentClass: 'bg-mandi' },
  { to: '/buyer/matches', title: 'Match Found', subtitle: 'View matched farmers', accentClass: 'bg-field' },
  { to: '/buyer/transactions', title: 'Transactions', subtitle: 'Orders & payments', accentClass: 'bg-soil' },
  { to: '/buyer/live-market', title: 'Live Market Trade', subtitle: 'Real-time bidding', accentClass: 'bg-alert' }
];

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [matches, setMatches] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    api.get('/buyer/dashboard-summary').then(({ data }) => setSummary(data.summary));
    api.get('/buyer/match-feed').then(({ data }) => setMatches(data.matches.slice(0, 3)));
    api.get('/market/auctions', { params: { status: 'LIVE' } }).then(({ data }) => setAuctions(data.auctions.slice(0, 3)));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-field-dark">Welcome back, {user?.businessName}</h1>
          <p className="text-field-dark/60 text-sm mt-1">Track your sourcing, active bids and verified supply.</p>
        </div>
        <WeatherWidget state={user?.state} district={user?.district} />
      </div>

      <QuickNavCards cards={CARDS} />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <SummaryStat label="Open requirements" value={summary.openRequirements} />
          <SummaryStat label="Completed deals" value={summary.completedDeals} />
          <SummaryStat label="Total spend" value={`₹${summary.totalSpend.toLocaleString('en-IN')}`} />
          <SummaryStat label="Live auctions on platform" value={summary.liveAuctions} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <section>
          <h2 className="font-display text-lg text-field-dark mb-3">Match Found</h2>
          {matches.length === 0 ? (
            <p className="panel p-5 text-sm text-field-dark/50">Post a requirement to get matched with farmers.</p>
          ) : (
            <div className="space-y-4">
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
        </section>

        <section>
          <h2 className="font-display text-lg text-field-dark mb-3">Live Market Trade</h2>
          {auctions.length === 0 ? (
            <p className="panel p-5 text-sm text-field-dark/50">No live auctions right now.</p>
          ) : (
            <div className="space-y-4">
              {auctions.map((a) => <AuctionCard key={a.id} auction={a} canBid={false} />)}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-field-dark/50">{label}</p>
      <p className="font-display text-xl text-field-dark mt-1">{value}</p>
    </div>
  );
}
