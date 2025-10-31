import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import RoutesPage from './pages/RoutesPage';
import RealTimePage from './pages/RealTimePage';
import EmissionsPage from './pages/EmissionsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/real-time" element={<RealTimePage />} />
            <Route path="/emissions" element={<EmissionsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
