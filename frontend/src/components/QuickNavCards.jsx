import { Link } from 'react-router-dom';

export default function QuickNavCards({ cards }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Link key={c.to} to={c.to} className="panel p-5 hover:shadow-md hover:-translate-y-0.5 transition block">
          <div className={`w-9 h-9 rounded-lg ${c.accentClass} mb-3`} />
          <p className="font-display text-base text-field-dark">{c.title}</p>
          <p className="text-xs text-field-dark/50 mt-0.5">{c.subtitle}</p>
        </Link>
      ))}
    </div>
  );
}
