// Approximate centroid coordinates for major Indian states (used only to
// estimate inter-state transport distance for the "true in-hand price"
// calculation - not for precision mapping).
export const STATE_COORDS = {
  'Andhra Pradesh': [15.9129, 79.74],
  'Assam': [26.2006, 92.9376],
  'Bihar': [25.0961, 85.3131],
  'Chhattisgarh': [21.2787, 81.8661],
  'Delhi': [28.7041, 77.1025],
  'Gujarat': [22.2587, 71.1924],
  'Haryana': [29.0588, 76.0856],
  'Himachal Pradesh': [31.1048, 77.1734],
  'Jharkhand': [23.6102, 85.2799],
  'Karnataka': [15.3173, 75.7139],
  'Kerala': [10.8505, 76.2711],
  'Madhya Pradesh': [22.9734, 78.6569],
  'Maharashtra': [19.7515, 75.7139],
  'Odisha': [20.9517, 85.0985],
  'Punjab': [31.1471, 75.3412],
  'Rajasthan': [27.0238, 74.2179],
  'Tamil Nadu': [11.1271, 78.6569],
  'Telangana': [18.1124, 79.0193],
  'Uttar Pradesh': [26.8467, 80.9462],
  'Uttarakhand': [30.0668, 79.0193],
  'West Bengal': [22.9868, 87.855]
};

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversine([lat1, lon1], [lat2, lon2]) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Estimates road distance (km) between two farmer/buyer locations.
// Same district: short local haul. Same state, different district: mid haul.
// Different state: haversine between state centroids, scaled up ~1.25x
// to roughly approximate road distance over straight-line distance.
export function estimateDistanceKm(originState, originDistrict, destState, destDistrict) {
  if (originState === destState && originDistrict === destDistrict) return 25;
  if (originState === destState) return 120;
  const a = STATE_COORDS[originState];
  const b = STATE_COORDS[destState];
  if (!a || !b) return 600; // unknown state pair fallback
  return Math.round(haversine(a, b) * 1.25);
}
