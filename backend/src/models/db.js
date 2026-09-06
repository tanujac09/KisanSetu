import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

const DEFAULT_DB = {
  farmers: [],
  buyers: [],
  products: [],
  requirements: [],
  transactions: [],
  auctions: [],
  priceHistory: {},
  otps: {}
};

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

export function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Read-modify-write helper. `mutator` receives the live db object,
// may mutate it in place, and optionally returns a value to hand back.
export function update(mutator) {
  const db = readDb();
  const result = mutator(db);
  writeDb(db);
  return result;
}
