import { estimateDistanceKm } from './distance.js';

// Transport cost per quintal scales with distance; commission is the
// platform's cut of the gross deal value. Both are subtracted from the
// buyer's headline price to get the farmer's true in-hand net payout.
const TRANSPORT_RATE_PER_KM_PER_QUINTAL = 1.1; // rupees
const TRANSPORT_BASE_FEE = 150; // flat rupees per trip
const COMMISSION_RATE = 0.02; // 2% platform commission on gross value

export function computeTransportCost(originState, originDistrict, destState, destDistrict, quantity) {
  const km = estimateDistanceKm(originState, originDistrict, destState, destDistrict);
  return Math.round(TRANSPORT_BASE_FEE + km * TRANSPORT_RATE_PER_KM_PER_QUINTAL * Math.min(quantity, 50) / 10);
}

export function computeCommission(grossValue) {
  return Math.round(grossValue * COMMISSION_RATE);
}

function quantityFitScore(supply, demand) {
  if (supply <= 0 || demand <= 0) return 0;
  const ratio = Math.min(supply, demand) / Math.max(supply, demand);
  return ratio; // 1 = perfect fit, lower if very mismatched
}

function priceAttractivenessScore(netPayout, benchmarkPrice, quantity) {
  if (!benchmarkPrice || quantity <= 0) return 0.5;
  const perQuintalNet = netPayout / quantity;
  const ratio = perQuintalNet / benchmarkPrice;
  return Math.max(0, Math.min(1, ratio));
}

// Ranks buyer requirements against one farmer product by projected
// in-hand profit (after transport + commission), not just headline price.
export function matchFarmerProduct(product, requirements, buyersById) {
  return requirements
    .filter((r) => r.status === 'OPEN' && r.crop === product.crop)
    .map((r) => {
      const buyer = buyersById.get(r.buyerId);
      if (!buyer) return null;
      const quantity = Math.min(product.quantity, r.quantity);
      const grossValue = quantity * r.maxPrice;
      const transportCost = computeTransportCost(product.state, product.district, r.state, r.district, quantity);
      const commission = computeCommission(grossValue);
      const netPayout = Math.max(0, grossValue - transportCost - commission);
      const matchPercentage = Math.round(
        100 *
          (0.55 * quantityFitScore(product.quantity, r.quantity) +
            0.45 * priceAttractivenessScore(netPayout, product.expectedPrice, quantity))
      );
      return {
        requirementId: r.id,
        productId: product.id,
        buyerId: buyer.id,
        buyerName: buyer.businessName,
        buyerRating: buyer.rating,
        verified: buyer.verified,
        crop: product.crop,
        buyerQuantity: r.quantity,
        buyerOfferPrice: r.maxPrice,
        transportCost,
        commission,
        netPayout,
        matchPercentage: Math.max(0, Math.min(100, matchPercentage))
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.netPayout - a.netPayout || b.matchPercentage - a.matchPercentage);
}

// Ranks farmer products against one buyer requirement by best projected
// value for the buyer: cheap enough, close enough, well rated.
export function matchBuyerRequirement(requirement, products, farmersById) {
  return products
    .filter((p) => p.status === 'AVAILABLE' && p.crop === requirement.crop)
    .map((p) => {
      const farmer = farmersById.get(p.farmerId);
      if (!farmer) return null;
      const quantity = Math.min(p.quantity, requirement.quantity);
      const grossValue = quantity * Math.min(p.expectedPrice, requirement.maxPrice);
      const transportCost = computeTransportCost(p.state, p.district, requirement.state, requirement.district, quantity);
      const commission = computeCommission(grossValue);
      const netPayout = Math.max(0, grossValue - transportCost - commission);
      const priceFit = p.expectedPrice <= requirement.maxPrice
        ? 1
        : Math.max(0, 1 - (p.expectedPrice - requirement.maxPrice) / requirement.maxPrice);
      const matchPercentage = Math.round(
        100 * (0.4 * quantityFitScore(p.quantity, requirement.quantity) + 0.4 * priceFit + 0.2 * ((farmer.rating || 4) / 5))
      );
      return {
        productId: p.id,
        requirementId: requirement.id,
        farmerId: farmer.id,
        farmerName: farmer.name,
        farmerRating: farmer.rating || 4.2,
        verified: farmer.verified !== false,
        crop: p.crop,
        farmerQuantity: p.quantity,
        farmerAskPrice: p.expectedPrice,
        transportCost,
        commission,
        netPayout,
        matchPercentage: Math.max(0, Math.min(100, matchPercentage))
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchPercentage - a.matchPercentage || a.farmerAskPrice - b.farmerAskPrice);
}
