import { getWeather } from '../utils/weather.js';

export async function fetchWeather(req, res) {
  const state = req.query.state;
  const district = req.query.district;
  if (!state) return res.status(400).json({ message: 'state query parameter is required.' });
  const weather = await getWeather(state, district);
  res.json({ weather });
}
