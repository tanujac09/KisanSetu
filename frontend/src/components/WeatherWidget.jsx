import { useEffect, useState } from 'react';
import api from '../services/api.js';

const ICON = {
  Clear: '\u2600\ufe0f',
  'Partly Sunny': '\u26c5',
  Cloudy: '\u2601\ufe0f',
  'Rain likely': '\ud83c\udf27\ufe0f'
};

export default function WeatherWidget({ state, district }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!state) return;
    api.get('/weather', { params: { state, district } }).then(({ data }) => setWeather(data.weather)).catch(() => {});
  }, [state, district]);

  if (!state) return null;

  return (
    <div className="panel px-3.5 py-2.5 flex items-center gap-3 text-xs">
      <span className="text-lg leading-none">{weather ? ICON[weather.condition] || '\u26c5' : '\u2b1c'}</span>
      {weather ? (
        <div className="leading-tight">
          <p className="font-medium text-field-dark">{weather.temperatureC}\u00b0C &middot; {district || state}</p>
          <p className="text-field-dark/50">Humidity {weather.humidity}% &middot; Rain {weather.rainChance}% &middot; Wind {weather.windKph} kph</p>
        </div>
      ) : (
        <p className="text-field-dark/40">Loading weather...</p>
      )}
    </div>
  );
}
