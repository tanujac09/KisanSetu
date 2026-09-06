import { readDb, update } from '../models/db.js';
import { genId } from '../utils/id.js';
import { computeCommission, computeTransportCost } from '../utils/matching.js';

// Buyer proposes a direct deal off a Match Found card (outside the auction
// flow). Either side can trigger it as long as they own the relevant record.
export function proposeDeal(req, res) {
  const { productId, requirementId } = req.body;
  if (!productId || !requirementId) return res.status(400).json({ message: 'productId and requirementId are required.' });
  const db = readDb();
  const product = db.products.find((p) => p.id === productId);
  const requirement = db.requirements.find((r) => r.id === requirementId);
  if (!product || !requirement) return res.status(404).json({ message: 'Listing or requirement not found.' });
  const isOwner = (req.user.role === 'farmer' && product.farmerId === req.user.id) || (req.user.role === 'buyer' && requirement.buyerId === req.user.id);
  if (!isOwner) return res.status(403).json({ message: 'You can only propose deals involving your own listings or requirements.' });
  if (product.status !== 'AVAILABLE') return res.status(400).json({ message: 'This listing is no longer available.' });
  if (requirement.status !== 'OPEN') return res.status(400).json({ message: 'This requirement is no longer open.' });
  if (product.crop !== requirement.crop) return res.status(400).json({ message: 'Crop mismatch between listing and requirement.' });

  const farmer = db.farmers.find((f) => f.id === product.farmerId);
  const buyer = db.buyers.find((b) => b.id === requirement.buyerId);
  const quantity = Math.min(product.quantity, requirement.quantity);
  const pricePerQuintal = requirement.maxPrice;
  const grossValue = quantity * pricePerQuintal;
  const transportCost = computeTransportCost(farmer.state, farmer.district, buyer.state, buyer.district, quantity);
  const commission = computeCommission(grossValue);
  const netPayout = Math.max(0, grossValue - transportCost - commission);

  const transaction = {
    id: genId('txn'),
    source: 'MATCH',
    productId,
    requirementId,
    farmerId: farmer.id,
    buyerId: buyer.id,
    buyerName: buyer.businessName,
    farmerName: farmer.name,
    crop: product.crop,
    quantity,
    pricePerQuintal,
    totalAmount: grossValue,
    transportCost,
    commission,
    netPayout,
    verificationStatus: 'NOT_REQUESTED',
    verificationDetail: '',
    payoutStatus: 'PENDING',
    createdAt: new Date().toISOString()
  };

  update((d) => {
    d.transactions.push(transaction);
    const p = d.products.find((x) => x.id === productId);
    if (p) p.status = p.quantity <= quantity ? 'SOLD' : p.status;
    const r = d.requirements.find((x) => x.id === requirementId);
    if (r) r.status = r.quantity <= quantity ? 'FULFILLED' : r.status;
  });

  res.status(201).json({ message: 'Deal proposed and recorded.', transaction });
}

export function requestVerification(req, res) {
  const { type } = req.body; // 'AI' | 'PHYSICAL'
  if (!['AI', 'PHYSICAL'].includes(type)) return res.status(400).json({ message: 'Verification type must be AI or PHYSICAL.' });
  const db = readDb();
  const txn = db.transactions.find((t) => t.id === req.params.id && t.buyerId === req.user.id);
  if (!txn) return res.status(404).json({ message: 'Transaction not found.' });
  if (txn.verificationStatus !== 'NOT_REQUESTED') return res.status(400).json({ message: 'Verification has already been requested for this transaction.' });

  if (type === 'AI') {
    const passed = Math.random() < 0.88;
    update((d) => {
      const t = d.transactions.find((x) => x.id === req.params.id);
      t.verificationStatus = passed ? 'PASSED' : 'FLAGGED';
      t.verificationDetail = passed
        ? 'AI virtual verification complete: produce quality and quantity match the listing.'
        : 'AI virtual verification flagged a discrepancy. A physical inspection is recommended before payout.';
    });
  } else {
    update((d) => {
      const t = d.transactions.find((x) => x.id === req.params.id);
      t.verificationStatus = 'INSPECTION_SCHEDULED';
      t.verificationDetail = 'Physical inspection scheduled. An inspector will visit within 2 business days.';
    });
    // Demo-only: resolve the scheduled inspection automatically after a
    // short delay so the flow can be seen end-to-end without a real inspector.
    setTimeout(() => {
      update((d) => {
        const t = d.transactions.find((x) => x.id === req.params.id);
        if (t && t.verificationStatus === 'INSPECTION_SCHEDULED') {
          const passed = Math.random() < 0.85;
          t.verificationStatus = passed ? 'PASSED' : 'FLAGGED';
          t.verificationDetail = passed
            ? 'Physical inspection complete: produce quality confirmed on-site.'
            : 'Physical inspection flagged quality issues. Please contact the farmer before releasing payout.';
        }
      });
    }, 15000);
  }
  const updated = readDb().transactions.find((t) => t.id === req.params.id);
  res.json({ message: 'Verification requested.', transaction: updated });
}

export function releasePayout(req, res) {
  const db = readDb();
  const txn = db.transactions.find((t) => t.id === req.params.id && t.buyerId === req.user.id);
  if (!txn) return res.status(404).json({ message: 'Transaction not found.' });
  if (txn.verificationStatus !== 'PASSED') return res.status(400).json({ message: 'Verification must pass before payout can be released.' });
  if (txn.payoutStatus === 'PAID') return res.status(400).json({ message: 'Payout has already been released.' });
  update((d) => {
    const t = d.transactions.find((x) => x.id === req.params.id);
    t.payoutStatus = 'PAID';
    t.paidAt = new Date().toISOString();
  });
  res.json({ message: 'Payout released to the farmer.' });
}
