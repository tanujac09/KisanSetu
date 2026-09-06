import { readDb, update } from '../models/db.js';
import { genId } from '../utils/id.js';
import { matchBuyerRequirement } from '../utils/matching.js';

export function listRequirements(req, res) {
  const db = readDb();
  const requirements = db.requirements.filter((r) => r.buyerId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ requirements });
}

export function createRequirement(req, res) {
  const { crop, quantity, maxPrice, deliveryDeadline, notes, state, district } = req.body;
  if (!crop || !quantity || !maxPrice) return res.status(400).json({ message: 'Crop, quantity and max price are required.' });
  const requirement = {
    id: genId('req'),
    buyerId: req.user.id,
    crop,
    quantity: Number(quantity),
    maxPrice: Number(maxPrice),
    deliveryDeadline: deliveryDeadline || null,
    notes: notes || '',
    state,
    district,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };
  update((d) => { d.requirements.push(requirement); });
  res.status(201).json({ requirement });
}

export function deleteRequirement(req, res) {
  const db = readDb();
  const requirement = db.requirements.find((r) => r.id === req.params.id && r.buyerId === req.user.id);
  if (!requirement) return res.status(404).json({ message: 'Requirement not found.' });
  if (requirement.status !== 'OPEN') return res.status(400).json({ message: 'Only open requirements can be removed.' });
  update((d) => { d.requirements = d.requirements.filter((r) => r.id !== req.params.id); });
  res.json({ message: 'Requirement removed.' });
}

export function getRequirementMatches(req, res) {
  const db = readDb();
  const requirement = db.requirements.find((r) => r.id === req.params.id && r.buyerId === req.user.id);
  if (!requirement) return res.status(404).json({ message: 'Requirement not found.' });
  const farmersById = new Map(db.farmers.map((f) => [f.id, f]));
  const matches = matchBuyerRequirement(requirement, db.products, farmersById);
  res.json({ matches });
}

export function listTransactions(req, res) {
  const db = readDb();
  const transactions = db.transactions
    .filter((t) => t.buyerId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ transactions });
}

export function dashboardSummary(req, res) {
  const db = readDb();
  const myRequirements = db.requirements.filter((r) => r.buyerId === req.user.id);
  const myTransactions = db.transactions.filter((t) => t.buyerId === req.user.id);
  const liveAuctions = db.auctions.filter((a) => a.status === 'LIVE');
  const summary = {
    openRequirements: myRequirements.filter((r) => r.status === 'OPEN').length,
    completedDeals: myTransactions.filter((t) => t.payoutStatus === 'PAID').length,
    totalSpend: myTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
    liveAuctions: liveAuctions.length
  };
  res.json({ summary });
}

export function matchFeed(req, res) {
  const db = readDb();
  const myRequirements = db.requirements.filter((r) => r.buyerId === req.user.id && r.status === 'OPEN');
  const farmersById = new Map(db.farmers.map((f) => [f.id, f]));
  const all = myRequirements.flatMap((r) => matchBuyerRequirement(r, db.products, farmersById));
  all.sort((a, b) => b.matchPercentage - a.matchPercentage);
  res.json({ matches: all.slice(0, 10) });
}
