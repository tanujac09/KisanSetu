import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readDb, update } from '../models/db.js';
import { genId } from '../utils/id.js';
import { JWT_SECRET } from '../config/env.js';

function sign(user, role) {
  return jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '7d' });
}

function publicFarmer(f) {
  return { id: f.id, role: 'farmer', name: f.name, mobile: f.mobile, state: f.state, district: f.district, rating: f.rating, verified: f.verified, createdAt: f.createdAt };
}

function publicBuyer(b) {
  return { id: b.id, role: 'buyer', businessName: b.businessName, mobile: b.mobile, state: b.state, district: b.district, rating: b.rating, verified: b.verified, createdAt: b.createdAt };
}

const AADHAAR_RE = /^\d{12}$/;
const MOBILE_RE = /^\d{10}$/;

export function farmerRegister(req, res) {
  const { name, aadhaar, mobile, dob, state, district } = req.body;
  if (!name || !aadhaar || !mobile || !dob || !state || !district) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!AADHAAR_RE.test(aadhaar)) return res.status(400).json({ message: 'Aadhaar number must be exactly 12 digits.' });
  if (!MOBILE_RE.test(mobile)) return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });

  const db = readDb();
  if (db.farmers.some((f) => f.aadhaar === aadhaar)) {
    return res.status(409).json({ message: 'A farmer with this Aadhaar number is already registered.' });
  }
  const farmer = {
    id: genId('farmer'),
    name,
    aadhaar,
    mobile,
    dob,
    state,
    district,
    rating: 4.3,
    verified: true,
    createdAt: new Date().toISOString()
  };
  update((d) => { d.farmers.push(farmer); });
  const token = sign(farmer, 'farmer');
  res.status(201).json({ token, user: publicFarmer(farmer) });
}

export function farmerLogin(req, res) {
  const { aadhaar, mobile, dob } = req.body;
  if (!aadhaar || !mobile || !dob) return res.status(400).json({ message: 'Aadhaar, mobile and date of birth are required.' });
  const db = readDb();
  const farmer = db.farmers.find((f) => f.aadhaar === aadhaar && f.mobile === mobile && f.dob === dob);
  if (!farmer) return res.status(401).json({ message: 'We could not verify those identity details. Check and try again.' });
  const token = sign(farmer, 'farmer');
  res.json({ token, user: publicFarmer(farmer) });
}

export function buyerRegister(req, res) {
  const { businessName, mobile, password, state, district } = req.body;
  if (!businessName || !mobile || !password || !state || !district) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!MOBILE_RE.test(mobile)) return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const db = readDb();
  if (db.buyers.some((b) => b.mobile === mobile)) {
    return res.status(409).json({ message: 'A buyer account already exists with this mobile number.' });
  }
  const buyer = {
    id: genId('buyer'),
    businessName,
    mobile,
    passwordHash: bcrypt.hashSync(password, 10),
    state,
    district,
    rating: 4.0,
    verified: false,
    createdAt: new Date().toISOString()
  };
  update((d) => { d.buyers.push(buyer); });
  const token = sign(buyer, 'buyer');
  res.status(201).json({ token, user: publicBuyer(buyer) });
}

export function buyerLogin(req, res) {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ message: 'Mobile and password are required.' });
  const db = readDb();
  const buyer = db.buyers.find((b) => b.mobile === mobile);
  if (!buyer || !bcrypt.compareSync(password, buyer.passwordHash)) {
    return res.status(401).json({ message: 'Incorrect mobile number or password.' });
  }
  const token = sign(buyer, 'buyer');
  res.json({ token, user: publicBuyer(buyer) });
}

export function buyerOtpRequest(req, res) {
  const { mobile } = req.body;
  if (!MOBILE_RE.test(mobile || '')) return res.status(400).json({ message: 'Enter a valid 10 digit mobile number.' });
  const db = readDb();
  const buyer = db.buyers.find((b) => b.mobile === mobile);
  if (!buyer) return res.status(404).json({ message: 'No buyer account found for this mobile number. Please register first.' });
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  update((d) => {
    d.otps[mobile] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  });
  // In production this would be sent via an SMS gateway. Returned here
  // (devOtp) purely so the demo is usable without one.
  res.json({ message: 'OTP sent to your mobile number.', devOtp: otp });
}

export function buyerOtpVerify(req, res) {
  const { mobile, otp } = req.body;
  const db = readDb();
  const record = db.otps[mobile];
  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return res.status(401).json({ message: 'Invalid or expired OTP.' });
  }
  const buyer = db.buyers.find((b) => b.mobile === mobile);
  if (!buyer) return res.status(404).json({ message: 'No buyer account found for this mobile number.' });
  update((d) => { delete d.otps[mobile]; });
  const token = sign(buyer, 'buyer');
  res.json({ token, user: publicBuyer(buyer) });
}

export function me(req, res) {
  const db = readDb();
  if (req.user.role === 'farmer') {
    const farmer = db.farmers.find((f) => f.id === req.user.id);
    if (!farmer) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ user: publicFarmer(farmer) });
  }
  const buyer = db.buyers.find((b) => b.id === req.user.id);
  if (!buyer) return res.status(404).json({ message: 'Account not found.' });
  res.json({ user: publicBuyer(buyer) });
}
