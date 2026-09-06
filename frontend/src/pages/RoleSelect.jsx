import { Link } from 'react-router-dom';

export default function RoleSelect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] px-4">
      <div className="max-w-3xl w-full text-center">
        <p className="font-display text-4xl text-field-dark mb-2">Kisan Setu</p>
        <p className="text-field-dark/60 mb-10">Direct farm-to-market trading - fair pricing, full transparency, no middlemen.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="panel p-8">
            <p className="font-display text-xl text-field-dark mb-2">I am a Farmer</p>
            <p className="text-sm text-field-dark/50 mb-6">List produce, get matched with buyers, run live auctions.</p>
            <div className="flex flex-col gap-2">
              <Link to="/farmer/login" className="btn-primary">Log in</Link>
              <Link to="/farmer/register" className="text-sm text-field hover:underline mt-1">New farmer? Register</Link>
            </div>
          </div>
          <div className="panel p-8">
            <p className="font-display text-xl text-field-dark mb-2">I am a Buyer / Trader</p>
            <p className="text-sm text-field-dark/50 mb-6">Source produce directly, bid in real time, verify before you pay.</p>
            <div className="flex flex-col gap-2">
              <Link to="/buyer/login" className="btn-primary bg-mandi hover:bg-mandi-dark">Log in</Link>
              <Link to="/buyer/register" className="text-sm text-mandi hover:underline mt-1">New buyer? Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
