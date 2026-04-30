import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const links = [
  { label: 'OVERVIEW', items: [
    { to: '/', icon: '📊', text: 'Dashboard' },
  ]},
  { label: 'MANAGEMENT', items: [
    { to: '/conferences', icon: '🏛️', text: 'Conferences' },
    { to: '/speakers', icon: '🎤', text: 'Speakers' },
    { to: '/sessions', icon: '📅', text: 'Sessions' },
    { to: '/themes', icon: '🏷️', text: 'Themes' },
  ]},
  { label: 'PEOPLE', items: [
    { to: '/registrations', icon: '📝', text: 'Registrations' },
    { to: '/participants', icon: '👥', text: 'Participants' },
    { to: '/submissions', icon: '📄', text: 'Submissions' },
    { to: '/researches', icon: '📚', text: 'Researches' },
  ]},
  { label: 'CREDENTIALS', items: [
    { to: '/certificates', icon: '🎓', text: 'Certificates' },
  ]},
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      // Force redirect even if API call fails
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">B1</div>
        <div>
          <span className="sidebar__brand-text">Blida1 Portal</span>
          <span className="sidebar__brand-sub">Admin Dashboard</span>
        </div>
      </div>
      <nav className="sidebar__nav">
        {links.map((section) => (
          <div key={section.label}>
            <div className="sidebar__section-label">{section.label}</div>
            {section.items.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                <span className="icon">{link.icon}</span>
                {link.text}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      {/* Admin info + logout */}
      <div className="sidebar__footer">
        <div className="sidebar__admin-info">
          <div className="sidebar__admin-avatar">
            {admin?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="sidebar__admin-details">
            <span className="sidebar__admin-name">{admin?.fullName || 'Admin'}</span>
            <span className="sidebar__admin-email">{admin?.email || ''}</span>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
