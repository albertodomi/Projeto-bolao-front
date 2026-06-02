import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/Campaigns/CampaignDetails';
import CreateBet from './pages/Bets/CreateBet';
import MyBets from './pages/Bets/MyBets';
import AdminCampaigns from './pages/Admin/Campaigns';
import ManageCampaign from './pages/Admin/Campaigns/ManageCampaign';
import AdminUsers from './pages/Admin/Users';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'ADMIN' | 'USER' }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If not matching role, redirect to appropriate home
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/campanhas' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Public/Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* User Routes */}
        <Route 
          element={
            <ProtectedRoute requiredRole="USER">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campanhas" element={<Campaigns />} />
          <Route path="/campanhas/:id" element={<CampaignDetails />} />
          <Route path="/campanhas/:id/apostar" element={<CreateBet />} />
          <Route path="/minhas-apostas" element={<MyBets />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/campanhas" replace />} />
          <Route path="campanhas" element={<AdminCampaigns />} />
          <Route path="campanhas/nova" element={<ManageCampaign />} />
          <Route path="campanhas/:id" element={<ManageCampaign />} />
          <Route path="usuarios" element={<AdminUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
