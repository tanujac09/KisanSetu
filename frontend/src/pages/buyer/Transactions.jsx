import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import api from '../../services/api.js';

const VERIFICATION_STYLE = {
  NOT_REQUESTED: 'bg-soil/10 text-soil',
  INSPECTION_SCHEDULED: 'bg-harvest/20 text-harvest-dark',
  PASSED: 'bg-field/10 text-field',
  FLAGGED: 'bg-alert/10 text-alert'
};

export default function BuyerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [busyId, setBusyId] = useState('');

  function load() {
    api.get('/buyer/transactions').then(({ data }) => setTransactions(data.transactions));
  }

  useEffect(() => { load(); }, []);

  async function requestVerification(id, type) {
    setBusyId(id);
    try {
      await api.post(`/transactions/${id}/verification`, { type });
      load();
    } finally {
      setBusyId('');
    }
  }

  async function releasePayout(id) {
    setBusyId(id);
    try {
      await api.post(`/transactions/${id}/release-payout`);
      load();
    } finally {
      setBusyId('');
    }
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-field-dark mb-1">Transactions</h1>
      <p className="text-field-dark/60 text-sm mb-6">Verify supply quality before releasing payment - choose AI verification for speed, or a physical inspection for higher-value deals.</p>

      {transactions.length === 0 ? (
        <p className="panel p-6 text-sm text-field-dark/50">No transactions yet.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => (
            <div key={t.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{t.crop} &middot; {t.quantity} quintal</p>
                  <p className="text-xs text-field-dark/50">₹{t.pricePerQuintal}/quintal &middot; Total ₹{t.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-pill font-medium ${VERIFICATION_STYLE[t.verificationStatus] || ''}`}>
                  {t.verificationStatus.replace(/_/g, ' ')}
                </span>
              </div>

              {t.verificationDetail && <p className="text-xs text-field-dark/60 mt-3">{t.verificationDetail}</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {t.verificationStatus === 'NOT_REQUESTED' && (
                  <>
                    <button
                      disabled={busyId === t.id}
                      onClick={() => requestVerification(t.id, 'AI')}
                      className="btn-outline text-sm py-2 px-4 border-mandi text-mandi hover:bg-mandi"
                    >
                      Request AI Verification
                    </button>
                    <button
                      disabled={busyId === t.id}
                      onClick={() => requestVerification(t.id, 'PHYSICAL')}
                      className="btn-outline text-sm py-2 px-4"
                    >
                      Request Physical Inspection
                    </button>
                  </>
                )}
                {t.verificationStatus === 'PASSED' && t.payoutStatus !== 'PAID' && (
                  <button disabled={busyId === t.id} onClick={() => releasePayout(t.id)} className="btn-primary text-sm py-2 px-4">
                    Release Payout
                  </button>
                )}
                {t.payoutStatus === 'PAID' && (
                  <span className="text-xs text-field font-medium py-2">Payout released</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
