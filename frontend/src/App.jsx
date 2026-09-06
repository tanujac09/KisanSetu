import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import RoleSelect from './pages/RoleSelect.jsx';
import FarmerLogin from './pages/farmer/Login.jsx';
import FarmerRegister from './pages/farmer/Register.jsx';
import BuyerLogin from './pages/buyer/Login.jsx';
import BuyerRegister from './pages/buyer/Register.jsx';

import FarmerDashboard from './pages/farmer/Dashboard.jsx';
import FarmerPostSell from './pages/farmer/PostSell.jsx';
import FarmerMatchFound from './pages/farmer/MatchFound.jsx';
import FarmerTransactions from './pages/farmer/Transactions.jsx';
import FarmerLiveMarket from './pages/farmer/LiveMarket.jsx';

import BuyerDashboard from './pages/buyer/Dashboard.jsx';
import BuyerPostRequirement from './pages/buyer/PostRequirement.jsx';
import BuyerMatchFound from './pages/buyer/MatchFound.jsx';
import BuyerTransactions from './pages/buyer/Transactions.jsx';
import BuyerLiveMarket from './pages/buyer/LiveMarket.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/farmer/login" element={<FarmerLogin />} />
      <Route path="/farmer/register" element={<FarmerRegister />} />
      <Route path="/buyer/login" element={<BuyerLogin />} />
      <Route path="/buyer/register" element={<BuyerRegister />} />

      <Route path="/farmer/dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/farmer/post" element={<ProtectedRoute role="farmer"><FarmerPostSell /></ProtectedRoute>} />
      <Route path="/farmer/matches" element={<ProtectedRoute role="farmer"><FarmerMatchFound /></ProtectedRoute>} />
      <Route path="/farmer/transactions" element={<ProtectedRoute role="farmer"><FarmerTransactions /></ProtectedRoute>} />
      <Route path="/farmer/live-market" element={<ProtectedRoute role="farmer"><FarmerLiveMarket /></ProtectedRoute>} />

      <Route path="/buyer/dashboard" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/buyer/post" element={<ProtectedRoute role="buyer"><BuyerPostRequirement /></ProtectedRoute>} />
      <Route path="/buyer/matches" element={<ProtectedRoute role="buyer"><BuyerMatchFound /></ProtectedRoute>} />
      <Route path="/buyer/transactions" element={<ProtectedRoute role="buyer"><BuyerTransactions /></ProtectedRoute>} />
      <Route path="/buyer/live-market" element={<ProtectedRoute role="buyer"><BuyerLiveMarket /></ProtectedRoute>} />

      <Route path="*" element={<RoleSelect />} />
    </Routes>
  );
}
