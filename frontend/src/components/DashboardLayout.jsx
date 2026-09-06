import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FARMER_LINKS = [
  { to: '/farmer/dashboard', label: 'Dashboard' },
  { to: '/farmer/post', label: 'Post (Sell)' },
  { to: '/farmer/matches', label: 'Match Found' },
  { to: '/farmer/transactions', label: 'Transactions' },
  { to: '/farmer/live-market', label: 'Live Market Trade' }
];

const BUYER_LINKS = [
  { to: '/buyer/dashboard', label: 'Dashboard' },
  { to: '/buyer/post', label: 'Post Requirement' },
  { to: '/buyer/matches', label: 'Match Found' },
  { to: '/buyer/transactions', label: 'Transactions' },
  { to: '/buyer/live-market', label: 'Live Market Trade' }
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = user?.role === 'farmer' ? FARMER_LINKS : BUYER_LINKS;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-field-dark text-white flex flex-col hidden md:flex">
        <div className="px-6 py-6">
          <p className="font-display text-xl">Kisan Setu</p>
          <p className="text-[11px] text-white/50 mt-0.5 uppercase tracking-wide">{user?.role === 'farmer' ? 'Farmer Portal' : 'Buyer Portal'}</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block px-3 py-2.5 rounded-lg text-sm transition ${
                location.pathname === l.to ? 'bg-white/15 font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="text-sm text-white/70 hover:text-white transition w-full text-left px-3 py-2">
            Log out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-field-dark text-white">
          <p className="font-display text-lg">Kisan Setu</p>
          <button onClick={handleLogout} className="text-xs text-white/70">Log out</button>
        </header>
        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
