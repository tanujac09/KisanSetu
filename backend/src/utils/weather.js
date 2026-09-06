import { STATE_COORDS } from './distance.js';

// Small offsets per district hash so different districts of the same state
// don't all report an identical reading.
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fallbackWeather(state, district) {
  const seed = hashString(`${state}|${district}|${new Date().toISOString().slice(0, 10)}`);
  const rand = (n) => (seed >> n) % 100 / 100;
  const baseTemp = 22 + rand(1) * 14; // 22-36C
  return {
    source: 'estimated',
    temperatureC: Math.round(baseTemp * 10) / 10,
    humidity: Math.round(40 + rand(3) * 45),
    rainChance: Math.round(rand(5) * 80),
    windKph: Math.round(6 + rand(7) * 20),
    condition: rand(9) > 0.7 ? 'Cloudy' : rand(9) > 0.4 ? 'Partly Sunny' : 'Clear'
  };
}

// Tries a live Open-Meteo lookup (no API key needed) using the state's
// approximate centroid; falls back to a deterministic estimate if the
// network call fails (e.g. no internet access in this environment).
export async function getWeather(state, district) {
  const coords = STATE_COORDS[state];
  if (!coords) return fallbackWeather(state, district || state);
  try {
    const [lat, lon] = coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('weather api error');
    const data = await res.json();
    const cur = data.current || {};
    return {
      source: 'live',
      temperatureC: cur.temperature_2m ?? null,
      humidity: cur.relative_humidity_2m ?? null,
      rainChance: cur.precipitation_probability ?? 0,
      windKph: cur.wind_speed_10m ?? null,
      condition: (cur.precipitation_probability ?? 0) > 50 ? 'Rain likely' : 'Clear'
    };
  } catch {
    return fallbackWeather(state, district || state);
  }
}
