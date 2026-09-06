import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api.js';

const REC_STYLE = {
  SELL_NOW: 'bg-field/10 text-field',
  HOLD: 'bg-harvest/20 text-harvest-dark'
};

export default function PriceIntelligenceWidget({ crop }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!crop) return;
    api.get(`/price/${encodeURIComponent(crop)}`).then(({ data }) => setData(data)).catch(() => setData(null));
  }, [crop]);

  if (!crop) return null;
  if (!data) return <div className="panel p-4 mt-1"><p className="text-xs text-field-dark/40">Loading price intelligence...</p></div>;

  const chartData = [...data.history.slice(-14).map((h) => ({ ...h, kind: 'history' })), ...data.forecast.map((f) => ({ ...f, kind: 'forecast' }))];

  return (
    <div className="panel p-4 mt-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-field-dark">{crop} price intelligence</p>
        <span className={`text-[11px] px-2 py-0.5 rounded-pill font-medium ${REC_STYLE[data.recommendation]}`}>
          {data.recommendation === 'SELL_NOW' ? 'Sell Now' : 'Hold'}
        </span>
      </div>
      <div className="h-32 mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip
              formatter={(value) => [`\u20b9${value}`, 'Price']}
              labelFormatter={(label) => label}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="price" stroke="#2F7D46" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-field-dark/50 mt-1">{data.reasoning}</p>
    </div>
  );
}
