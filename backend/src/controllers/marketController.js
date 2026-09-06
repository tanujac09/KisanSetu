import { readDb, update } from '../models/db.js';
import { genId } from '../utils/id.js';
import { computeCommission, computeTransportCost } from '../utils/matching.js';
import { getIo } from '../sockets/ioInstance.js';

// Auto-ends any LIVE auction whose timer has run out. Called on every read
// so state stays correct even without a background job, plus a periodic
// sweep runs from server.js for auctions nobody is actively polling.
export function sweepExpiredAuctions() {
  let changed = [];
  update((d) => {
    const now = Date.now();
    d.auctions.forEach((a) => {
      if (a.status === 'LIVE' && new Date(a.endsAt).getTime() <= now) {
        a.status = 'ENDED';
        changed.push(a.id);
      }
    });
  });
  const io = getIo();
  if (io && changed.length) changed.forEach((id) => io.to(`auction_${id}`).emit('auctionEnded', { auctionId: id }));
}

export function listAuctions(req, res) {
  sweepExpiredAuctions();
  const db = readDb();
  let auctions = db.auctions;
  if (req.query.status) auctions = auctions.filter((a) => a.status === req.query.status);
  auctions = [...auctions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  res.json({ auctions });
}

export function createAuction(req, res) {
  const { productId, startingPrice, durationMinutes } = req.body;
  if (!productId || !startingPrice || !durationMinutes) return res.status(400).json({ message: 'Product, starting price and duration are required.' });
  const db = readDb();
  const product = db.products.find((p) => p.id === productId && p.farmerId === req.user.id);
  if (!product) return res.status(404).json({ message: 'Listing not found.' });
  if (product.status !== 'AVAILABLE') return res.status(400).json({ message: 'This listing is not available to auction.' });

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + Number(durationMinutes) * 60 * 1000);
  const auction = {
    id: genId('auc'),
    productId: product.id,
    farmerId: product.farmerId,
    crop: product.crop,
    quantity: product.quantity,
    startingPrice: Number(startingPrice),
    currentBid: null,
    currentBidderId: null,
    currentBidderName: null,
    bids: [],
    durationMinutes: Number(durationMinutes),
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: 'LIVE',
    winnerId: null,
    finalPrice: null
  };
  update((d) => {
    d.auctions.push(auction);
    const p = d.products.find((x) => x.id === productId);
    if (p) p.status = 'IN_AUCTION';
  });
  const io = getIo();
  if (io) io.emit('auctionCreated', { auctionId: auction.id });
  res.status(201).json({ auction });
}

export function placeBid(req, res) {
  const { amount } = req.body;
  const db = readDb();
  const auction = db.auctions.find((a) => a.id === req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found.' });
  if (auction.status !== 'LIVE' || new Date(auction.endsAt).getTime() <= Date.now()) {
    return res.status(400).json({ message: 'This auction has already ended.' });
  }
  const minNext = auction.currentBid ? auction.currentBid + 1 : auction.startingPrice;
  if (!amount || Number(amount) < minNext) {
    return res.status(400).json({ message: `Your bid must be at least ₹${minNext}.` });
  }
  const buyer = db.buyers.find((b) => b.id === req.user.id);
  const bid = { buyerId: req.user.id, buyerName: buyer?.businessName || 'Buyer', amount: Number(amount), at: new Date().toISOString() };
  update((d) => {
    const a = d.auctions.find((x) => x.id === req.params.id);
    a.bids.push(bid);
    a.currentBid = bid.amount;
    a.currentBidderId = bid.buyerId;
    a.currentBidderName = bid.buyerName;
  });
  const io = getIo();
  if (io) io.to(`auction_${auction.id}`).emit('bidUpdate', { auctionId: auction.id, bid });
  res.json({ message: 'Bid placed.', currentBid: bid.amount });
}

export function finalizeAuction(req, res) {
  const db = readDb();
  const auction = db.auctions.find((a) => a.id === req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found.' });
  if (auction.farmerId !== req.user.id) return res.status(403).json({ message: 'Only the listing owner can finalize this auction.' });
  if (auction.status === 'FINALIZED') return res.status(400).json({ message: 'This auction is already finalized.' });
  if (!auction.currentBid || !auction.currentBidderId) return res.status(400).json({ message: 'No bids have been placed yet.' });

  const grossValue = auction.currentBid * auction.quantity;
  const buyer = db.buyers.find((b) => b.id === auction.currentBidderId);
  const farmer = db.farmers.find((f) => f.id === auction.farmerId);
  const transportCost = computeTransportCost(farmer.state, farmer.district, buyer.state, buyer.district, auction.quantity);
  const commission = computeCommission(grossValue);
  const netPayout = Math.max(0, grossValue - transportCost - commission);

  const transaction = {
    id: genId('txn'),
    source: 'AUCTION',
    productId: auction.productId,
    requirementId: null,
    farmerId: auction.farmerId,
    buyerId: auction.currentBidderId,
    buyerName: auction.currentBidderName,
    farmerName: farmer?.name,
    crop: auction.crop,
    quantity: auction.quantity,
    pricePerQuintal: auction.currentBid,
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
    const a = d.auctions.find((x) => x.id === req.params.id);
    a.status = 'FINALIZED';
    a.winnerId = auction.currentBidderId;
    a.finalPrice = auction.currentBid;
    const p = d.products.find((x) => x.id === auction.productId);
    if (p) p.status = 'SOLD';
    d.transactions.push(transaction);
  });

  const io = getIo();
  if (io) io.to(`auction_${auction.id}`).emit('auctionFinalized', { auctionId: auction.id, transactionId: transaction.id });
  res.json({ message: 'Auction finalized.', transaction });
}
