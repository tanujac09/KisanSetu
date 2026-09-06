import { readDb, update } from '../models/db.js';
import { genId } from '../utils/id.js';
import { matchFarmerProduct } from '../utils/matching.js';

export function listProducts(req, res) {
  const db = readDb();
  const products = db.products.filter((p) => p.farmerId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ products });
}

export function createProduct(req, res) {
  const { crop, variety, quantity, expectedPrice, harvestDate, description, state, district } = req.body;
  if (!crop || !quantity || !expectedPrice) return res.status(400).json({ message: 'Crop, quantity and expected price are required.' });
  const product = {
    id: genId('prod'),
    farmerId: req.user.id,
    crop,
    variety: variety || '',
    quantity: Number(quantity),
    expectedPrice: Number(expectedPrice),
    harvestDate: harvestDate || null,
    description: description || '',
    state,
    district,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  };
  update((d) => { d.products.push(product); });
  res.status(201).json({ product });
}

export function deleteProduct(req, res) {
  const db = readDb();
  const product = db.products.find((p) => p.id === req.params.id && p.farmerId === req.user.id);
  if (!product) return res.status(404).json({ message: 'Listing not found.' });
  if (product.status !== 'AVAILABLE') return res.status(400).json({ message: 'Only available listings can be removed.' });
  update((d) => { d.products = d.products.filter((p) => p.id !== req.params.id); });
  res.json({ message: 'Listing removed.' });
}

export function getProductMatches(req, res) {
  const db = readDb();
  const product = db.products.find((p) => p.id === req.params.id && p.farmerId === req.user.id);
  if (!product) return res.status(404).json({ message: 'Listing not found.' });
  const buyersById = new Map(db.buyers.map((b) => [b.id, b]));
  const matches = matchFarmerProduct(product, db.requirements, buyersById);
  res.json({ matches });
}

export function listTransactions(req, res) {
  const db = readDb();
  const transactions = db.transactions
    .filter((t) => t.farmerId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ transactions });
}

export function dashboardSummary(req, res) {
  const db = readDb();
  const myProducts = db.products.filter((p) => p.farmerId === req.user.id);
  const myTransactions = db.transactions.filter((t) => t.farmerId === req.user.id);
  const myAuctions = db.auctions.filter((a) => a.farmerId === req.user.id && a.status === 'LIVE');
  const summary = {
    activeListings: myProducts.filter((p) => p.status === 'AVAILABLE').length,
    completedDeals: myTransactions.filter((t) => t.payoutStatus === 'PAID').length,
    totalEarnings: myTransactions.filter((t) => t.payoutStatus === 'PAID').reduce((sum, t) => sum + t.netPayout, 0),
    liveAuctions: myAuctions.length
  };
  res.json({ summary });
}

export function matchFeed(req, res) {
  const db = readDb();
  const myProducts = db.products.filter((p) => p.farmerId === req.user.id && p.status === 'AVAILABLE');
  const buyersById = new Map(db.buyers.map((b) => [b.id, b]));
  const all = myProducts.flatMap((p) => matchFarmerProduct(p, db.requirements, buyersById));
  all.sort((a, b) => b.netPayout - a.netPayout);
  res.json({ matches: all.slice(0, 10) });
}
