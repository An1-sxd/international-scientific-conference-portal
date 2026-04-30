import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Sidebar from './components/Sidebar';
import { ConferenceProvider } from './components/ConferenceProvider';
import Dashboard from './pages/Dashboard';
import Conferences from './pages/Conferences';
import Speakers from './pages/Speakers';
import Sessions from './pages/Sessions';
import Themes from './pages/Themes';
import Registrations from './pages/Registrations';
import Participants from './pages/Participants';
import Submissions from './pages/Submissions';
import Researches from './pages/Researches';
import Certificates from './pages/Certificates';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page" style={{ justifyContent: 'center' }}>
        <div className="loader" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function DashboardLayout() {
  return (
    <ConferenceProvider>
      <div className="dashboard">
        <Sidebar />
        <div className="main-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/conferences" element={<Conferences />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/researches" element={<Researches />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </div>
      </div>
    </ConferenceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
