import { readDb, update } from '../models/db.js';

const BASE_PRICE = {
  Wheat: 2250,
  Rice: 2800,
  Soybean: 4300,
  Maize: 1950,
  Moong: 7800,
  Cotton: 6600,
  Sugarcane: 340,
  Groundnut: 5900
};

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generates a deterministic-but-organic 30 day price history for a crop so
// the demo always shows a believable trend without hitting a real mandi API.
export function generatePriceHistory(crop) {
  const base = BASE_PRICE[crop] || 3000;
  const rand = seededRandom(crop.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const days = 30;
  const history = [];
  let price = base * (0.92 + rand() * 0.1);
  const drift = (rand() - 0.45) * 6; // slight per-day trend bias
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    price += drift + (rand() - 0.5) * (base * 0.012);
    price = Math.max(base * 0.7, price);
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({ date: date.toISOString().slice(0, 10), price: Math.round(price) });
  }
  return history;
}

function linearRegression(points) {
  const n = points.length;
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.price);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept, n };
}

export function getPriceIntelligence(crop) {
  const db = update((d) => {
    if (!d.priceHistory[crop]) {
      d.priceHistory[crop] = generatePriceHistory(crop);
    }
    return d;
  });
  const history = db.priceHistory[crop] || generatePriceHistory(crop);
  const { slope, intercept, n } = linearRegression(history);
  const forecast = [];
  const lastDate = new Date(history[history.length - 1].date);
  for (let i = 1; i <= 7; i += 1) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    const predicted = Math.max(0, Math.round(intercept + slope * (n - 1 + i)));
    forecast.push({ date: date.toISOString().slice(0, 10), price: predicted });
  }
  const currentPrice = history[history.length - 1].price;
  const projectedPrice = forecast[forecast.length - 1].price;
  const changePct = ((projectedPrice - currentPrice) / currentPrice) * 100;
  let recommendation = 'HOLD';
  let reasoning = 'Prices look range-bound over the next week - selling now or waiting a few days should net similar returns.';
  if (changePct >= 2) {
    recommendation = 'HOLD';
    reasoning = `Prices are trending up (~${changePct.toFixed(1)}% over 7 days). Holding a little longer could fetch a better rate.`;
  } else if (changePct <= -2) {
    recommendation = 'SELL_NOW';
    reasoning = `Prices are trending down (~${changePct.toFixed(1)}% over 7 days). Selling now is likely to net more than waiting.`;
  }
  return { crop, history, forecast, currentPrice, projectedPrice, changePct: Math.round(changePct * 10) / 10, recommendation, reasoning };
}

export function listSupportedCrops() {
  return Object.keys(BASE_PRICE);
}
