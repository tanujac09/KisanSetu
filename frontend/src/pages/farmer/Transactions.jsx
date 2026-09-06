import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import api from '../../services/api.js';

const STATUS_STYLE = {
  PENDING: 'bg-harvest/20 text-harvest-dark',
  PAID: 'bg-field/10 text-field'
};

export default function FarmerTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get('/farmer/transactions').then(({ data }) => setTransactions(data.transactions));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Transactions</h1>
      <p className="text-field-dark/60 text-sm mb-6">A complete ledger of your completed and processing trades.</p>

      {transactions.length === 0 ? (
        <p className="panel p-6 text-sm text-field-dark/50">No transactions yet.</p>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-field-dark/50 border-b border-field/10">
                <th className="p-4 font-medium">Buyer</th>
                <th className="p-4 font-medium">Crop</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Price/quintal</th>
                <th className="p-4 font-medium">Net payout</th>
                <th className="p-4 font-medium">Verification</th>
                <th className="p-4 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-field/5 last:border-0">
                  <td className="p-4">{t.buyerName}</td>
                  <td className="p-4">{t.crop}</td>
                  <td className="p-4">{t.quantity} qtl</td>
                  <td className="p-4">₹{t.pricePerQuintal}</td>
                  <td className="p-4 font-medium">₹{t.netPayout.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className="text-xs text-field-dark/60">{t.verificationStatus.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-pill font-medium ${STATUS_STYLE[t.payoutStatus] || ''}`}>{t.payoutStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
