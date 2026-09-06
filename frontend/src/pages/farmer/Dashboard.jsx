import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import QuickNavCards from '../../components/QuickNavCards.jsx';
import WeatherWidget from '../../components/WeatherWidget.jsx';
import MatchCard from '../../components/MatchCard.jsx';
import AuctionCard from '../../components/AuctionCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

const CARDS = [
  { to: '/farmer/post', title: 'Post (Sell)', subtitle: 'List your produce', accentClass: 'bg-field' },
  { to: '/farmer/matches', title: 'Match Found', subtitle: 'View matched buyers', accentClass: 'bg-mandi' },
  { to: '/farmer/transactions', title: 'Transactions', subtitle: 'Orders & payments', accentClass: 'bg-soil' },
  { to: '/farmer/live-market', title: 'Live Market Trade', subtitle: 'Real-time bidding', accentClass: 'bg-harvest' }
];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [matches, setMatches] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get('/farmer/dashboard-summary').then(({ data }) => setSummary(data.summary));
    api.get('/farmer/match-feed').then(({ data }) => setMatches(data.matches.slice(0, 3)));
    api.get('/market/auctions', { params: { status: 'LIVE' } }).then(({ data }) => setAuctions(data.auctions.filter((a) => a.farmerId === user.id).slice(0, 3)));
    api.get('/farmer/transactions').then(({ data }) => setTransactions(data.transactions.slice(0, 5)));
  }, [user.id]);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-field-dark">Welcome back, {user?.name}</h1>
          <p className="text-field-dark/60 text-sm mt-1">Your produce, land assets and active market bids, all in one place.</p>
        </div>
        <WeatherWidget state={user?.state} district={user?.district} />
      </div>

      <QuickNavCards cards={CARDS} />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <SummaryStat label="Active listings" value={summary.activeListings} />
          <SummaryStat label="Completed deals" value={summary.completedDeals} />
          <SummaryStat label="Total earnings" value={`\u20b9${summary.totalEarnings.toLocaleString('en-IN')}`} />
          <SummaryStat label="Your live auctions" value={summary.liveAuctions} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <section>
          <h2 className="font-display text-lg text-field-dark mb-3">Match Found</h2>
          {matches.length === 0 ? (
            <p className="panel p-5 text-sm text-field-dark/50">Post produce to get matched with buyers.</p>
          ) : (
            <div className="space-y-4">
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
        </section>

        <section>
          <h2 className="font-display text-lg text-field-dark mb-3">Live Market Trade</h2>
          {auctions.length === 0 ? (
            <p className="panel p-5 text-sm text-field-dark/50">You have no live auctions right now.</p>
          ) : (
            <div className="space-y-4">
              {auctions.map((a) => <AuctionCard key={a.id} auction={a} canBid={false} />)}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg text-field-dark mb-3">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="panel p-5 text-sm text-field-dark/50">No transactions yet.</p>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-field-dark/50 border-b border-field/10">
                  <th className="p-4 font-medium">Buyer</th>
                  <th className="p-4 font-medium">Crop</th>
                  <th className="p-4 font-medium">Qty</th>
                  <th className="p-4 font-medium">Net payout</th>
                  <th className="p-4 font-medium">Payout</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-field/5 last:border-0">
                    <td className="p-4">{t.buyerName}</td>
                    <td className="p-4">{t.crop}</td>
                    <td className="p-4">{t.quantity} qtl</td>
                    <td className="p-4 font-medium">\u20b9{Math.round(t.netPayout).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-pill font-medium ${t.payoutStatus === 'PAID' ? 'bg-field/10 text-field' : 'bg-harvest/20 text-harvest-dark'}`}>{t.payoutStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
