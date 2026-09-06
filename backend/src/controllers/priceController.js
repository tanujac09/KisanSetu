import { getPriceIntelligence, listSupportedCrops } from '../utils/priceIntelligence.js';

export function getPrice(req, res) {
  const { crop } = req.params;
  res.json(getPriceIntelligence(crop));
}

export function getSupportedCrops(req, res) {
  res.json({ crops: listSupportedCrops() });
}
