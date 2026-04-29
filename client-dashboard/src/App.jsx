import { Routes, Route } from 'react-router-dom';
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
import Certificates from './pages/Certificates';

export default function App() {
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
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </div>
      </div>
    </ConferenceProvider>
  );
}
