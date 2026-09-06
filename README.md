# Kisan Setu — Direct Farm-to-Market Platform

Kisan Setu connects farmers directly with verified buyers/traders — profit-based
matching, real-time mandi auctions, predictive pricing, weather, and
buyer-driven quality verification — with no middlemen in between.

This repo has two parts:

```
kisan-setu/
  backend/    Express + Socket.IO API, JWT auth, JSON file datastore
  frontend/   Vite + React + Tailwind app
```

No database server is required — the backend persists to a single
`backend/data/db.json` file, so `npm install` is all you need to run it
anywhere, including a fresh GitHub Codespace or a local machine.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # adjust JWT_SECRET / CORS_ORIGIN if needed
npm run seed               # creates demo farmers, buyers, listings & requirements
npm run dev                 # starts the API on http://localhost:5000
```

### Demo accounts (created by `npm run seed`)

**Farmers** log in with Aadhaar + Mobile + Date of Birth:

| Name | Aadhaar | Mobile | DOB |
|---|---|---|---|
| Ramesh Patil | 111122223333 | 9876500001 | 1985-04-12 |
| Suresh Yadav | 222233334444 | 9876500002 | 1979-11-02 |
| Lakshmi Reddy | 333344445555 | 9876500003 | 1990-06-23 |

**Buyers/Traders** log in with Mobile + Password (or OTP — in this demo the
OTP is returned in the API response as `devOtp` instead of being SMS'd):

| Business | Mobile | Password |
|---|---|---|
| AgroFresh Traders | 9876600001 | password123 |
| National Grain Mills | 9876600002 | password123 |
| Deccan Commodities | 9876600003 | password123 |

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # points at the backend above by default
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173, pick Farmer or Buyer, and log in with one of the
demo accounts above (or register a new one).

## 3. What's implemented

**Auth**
- Farmer identity flow: Aadhaar (12 digits) + Mobile (10 digits) + DOB
- Buyer flow: password login, plus an OTP login (mocked SMS via `devOtp`)
- JWT sessions, role-guarded routes on both API and frontend

**Farmer portal**
- Post (Sell): list produce (crop, variety, quantity, price, harvest date)
- Match Found: buyer requirements ranked by *true net in-hand payout* after
  estimated transport cost and platform commission — not just headline price
- Transactions: ledger of completed/processing trades with payout status
- Live Market Trade: start a real-time auction on any available listing,
  watch bids arrive live via Socket.IO, finalize when satisfied
- Dashboard: quick-nav cards, compact live weather widget, summary stats,
  match feed preview, live-auction preview, recent transactions

**Buyer portal**
- Post Requirement: post crop/quantity/max price demand, see a live price
  forecast for that crop while posting
- Match Found: farmer listings ranked by best value (price fit, quantity fit,
  farmer rating)
- Transactions: request AI virtual verification (near-instant) or a physical
  inspection (auto-resolves after a short delay in this demo), then release
  payout once verification passes
- Live Market Trade: browse all live mandi auctions across the platform,
  filter by crop, place real-time bids
- Dashboard: quick-nav cards, weather, summary stats, match feed, live
  auctions preview

**Core matching/intelligence engine (backend)**
- `src/utils/matching.js` — profit-based smart matching: computes an
  estimated transport cost (haversine distance between state centroids,
  cheaper for same-district/same-state deals) and a 2% platform commission,
  then ranks matches by net in-hand result rather than raw price
- `src/utils/priceIntelligence.js` — seeds a 30-day synthetic price history
  per crop, fits a linear regression, forecasts 7 days ahead, and returns a
  SELL_NOW / HOLD recommendation with reasoning
- `src/utils/weather.js` — live lookup via the free Open-Meteo API (no key
  needed) with a deterministic offline fallback if the network call fails
- Socket.IO auction rooms (`auction_<id>`) broadcast `bidUpdate`,
  `auctionCreated`, `auctionEnded`, and `auctionFinalized` events; a 5-second
  server sweep auto-closes auctions whose timer has run out even if nobody
  is actively watching

## 4. API overview

All routes are mounted under `/api` and (except `/api/health` and the auth
endpoints) require `Authorization: Bearer <token>`.

```
POST   /api/auth/farmer/register
POST   /api/auth/farmer/login
POST   /api/auth/buyer/register
POST   /api/auth/buyer/login
POST   /api/auth/buyer/otp/request
POST   /api/auth/buyer/otp/verify
GET    /api/auth/me

GET    /api/farmer/products
POST   /api/farmer/products
DELETE /api/farmer/products/:id
GET    /api/farmer/products/:id/matches
GET    /api/farmer/transactions
GET    /api/farmer/dashboard-summary
GET    /api/farmer/match-feed

GET    /api/buyer/requirements
POST   /api/buyer/requirements
DELETE /api/buyer/requirements/:id
GET    /api/buyer/requirements/:id/matches
GET    /api/buyer/transactions
GET    /api/buyer/dashboard-summary
GET    /api/buyer/match-feed

GET    /api/market/auctions?status=LIVE
POST   /api/market/auctions               (farmer)
POST   /api/market/auctions/:id/bid       (buyer)
POST   /api/market/auctions/:id/finalize  (farmer)

POST   /api/transactions/propose                (either side, off a match)
POST   /api/transactions/:id/verification       (buyer)
POST   /api/transactions/:id/release-payout     (buyer)

GET    /api/price/crops
GET    /api/price/:crop

GET    /api/weather?state=...&district=...
```

## 5. Deploying

- **Backend**: any Node host (Render, Railway, a VPS, etc.) — just needs
  `npm install && npm run seed && npm start`, plus a writable disk for
  `data/db.json` (or point `DB_PATH` logic at a persistent volume).
- **Frontend**: `npm run build` produces a static `dist/` folder deployable
  to Vercel, Netlify, GitHub Pages, etc. Set `VITE_API_URL` and
  `VITE_SOCKET_URL` to your deployed backend's URL at build time.

## 6. Notes & limitations (by design, for a demo-scale build)

- Data persists to a JSON file rather than a real database — fine for a demo
  or small pilot, but swap in Postgres/Mongo for production scale.
- "AI verification" and the physical-inspection outcome are simulated
  (weighted random pass/fail) since there's no real inspection pipeline
  wired up.
- Payouts are marked `PAID` in the ledger rather than moving real money —
  wiring up a payment gateway (Razorpay/UPI) is the natural next step.
