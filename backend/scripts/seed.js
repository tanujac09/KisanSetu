import bcrypt from 'bcryptjs';
import { writeDb } from '../src/models/db.js';
import { genId } from '../src/utils/id.js';
import { generatePriceHistory } from '../src/utils/priceIntelligence.js';

const CROPS = ['Wheat', 'Rice', 'Soybean', 'Maize', 'Moong', 'Cotton'];

const now = () => new Date().toISOString();

const farmers = [
  { id: genId('farmer'), name: 'Ramesh Patil', aadhaar: '111122223333', mobile: '9876500001', dob: '1985-04-12', state: 'Maharashtra', district: 'Nashik', rating: 4.6, verified: true, createdAt: now() },
  { id: genId('farmer'), name: 'Suresh Yadav', aadhaar: '222233334444', mobile: '9876500002', dob: '1979-11-02', state: 'Madhya Pradesh', district: 'Indore', rating: 4.2, verified: true, createdAt: now() },
  { id: genId('farmer'), name: 'Lakshmi Reddy', aadhaar: '333344445555', mobile: '9876500003', dob: '1990-06-23', state: 'Andhra Pradesh', district: 'Guntur', rating: 4.8, verified: true, createdAt: now() }
];

const buyers = [
  { id: genId('buyer'), businessName: 'AgroFresh Traders', mobile: '9876600001', passwordHash: bcrypt.hashSync('password123', 10), state: 'Maharashtra', district: 'Pune', rating: 4.5, verified: true, createdAt: now() },
  { id: genId('buyer'), businessName: 'National Grain Mills', mobile: '9876600002', passwordHash: bcrypt.hashSync('password123', 10), state: 'Delhi', district: 'Delhi', rating: 4.1, verified: true, createdAt: now() },
  { id: genId('buyer'), businessName: 'Deccan Commodities', mobile: '9876600003', passwordHash: bcrypt.hashSync('password123', 10), state: 'Telangana', district: 'Hyderabad', rating: 3.9, verified: false, createdAt: now() }
];

const products = [
  { id: genId('prod'), farmerId: farmers[0].id, crop: 'Wheat', variety: 'Lokwan', quantity: 80, expectedPrice: 2280, harvestDate: '2026-03-15', description: 'Clean, sun-dried, 10% moisture.', state: farmers[0].state, district: farmers[0].district, status: 'AVAILABLE', createdAt: now() },
  { id: genId('prod'), farmerId: farmers[1].id, crop: 'Soybean', variety: 'JS-335', quantity: 50, expectedPrice: 4350, harvestDate: '2026-02-20', description: 'Good oil content, machine cleaned.', state: farmers[1].state, district: farmers[1].district, status: 'AVAILABLE', createdAt: now() },
  { id: genId('prod'), farmerId: farmers[2].id, crop: 'Rice', variety: 'Sona Masoori', quantity: 120, expectedPrice: 2850, harvestDate: '2026-01-30', description: 'Premium grade, low broken %.', state: farmers[2].state, district: farmers[2].district, status: 'AVAILABLE', createdAt: now() },
  { id: genId('prod'), farmerId: farmers[0].id, crop: 'Maize', variety: '', quantity: 60, expectedPrice: 1980, harvestDate: '2026-03-01', description: '', state: farmers[0].state, district: farmers[0].district, status: 'AVAILABLE', createdAt: now() }
];

const requirements = [
  { id: genId('req'), buyerId: buyers[0].id, crop: 'Wheat', quantity: 60, maxPrice: 2320, deliveryDeadline: '2026-04-01', notes: 'Need FCI-grade quality.', state: buyers[0].state, district: buyers[0].district, status: 'OPEN', createdAt: now() },
  { id: genId('req'), buyerId: buyers[1].id, crop: 'Soybean', quantity: 40, maxPrice: 4400, deliveryDeadline: '2026-03-10', notes: '', state: buyers[1].state, district: buyers[1].district, status: 'OPEN', createdAt: now() },
  { id: genId('req'), buyerId: buyers[2].id, crop: 'Rice', quantity: 100, maxPrice: 2900, deliveryDeadline: '2026-02-15', notes: 'Export quality preferred.', state: buyers[2].state, district: buyers[2].district, status: 'OPEN', createdAt: now() },
  { id: genId('req'), buyerId: buyers[0].id, crop: 'Maize', quantity: 30, maxPrice: 2050, deliveryDeadline: '2026-04-05', notes: '', state: buyers[0].state, district: buyers[0].district, status: 'OPEN', createdAt: now() }
];

const priceHistory = {};
CROPS.forEach((c) => { priceHistory[c] = generatePriceHistory(c); });

const db = {
  farmers,
  buyers,
  products,
  requirements,
  transactions: [],
  auctions: [],
  priceHistory,
  otps: {}
};

writeDb(db);

console.log('Seed complete.');
console.log('--- Demo Farmer logins (Aadhaar / Mobile / DOB) ---');
farmers.forEach((f) => console.log(`${f.name}: ${f.aadhaar} / ${f.mobile} / ${f.dob}`));
console.log('--- Demo Buyer logins (Mobile / Password) ---');
buyers.forEach((b) => console.log(`${b.businessName}: ${b.mobile} / password123`));
