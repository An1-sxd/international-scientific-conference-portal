import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useTheme } from './theme';
import {
  LayoutDashboard, Building2, Mic2, CalendarDays, Tag,
  ClipboardList, Users, FileText, BookOpen, Award, LogOut,
} from 'lucide-react';

const links = [
  { label: 'OVERVIEW', items: [
    { to: '/', icon: LayoutDashboard, text: 'Dashboard' },
  ]},
  { label: 'MANAGEMENT', items: [
    { to: '/conferences', icon: Building2, text: 'Conferences' },
    { to: '/speakers', icon: Mic2, text: 'Speakers' },
    { to: '/sessions', icon: CalendarDays, text: 'Sessions' },
    { to: '/themes', icon: Tag, text: 'Themes' },
  ]},
  { label: 'PEOPLE', items: [
    { to: '/registrations', icon: ClipboardList, text: 'Registrations' },
    { to: '/participants', icon: Users, text: 'Participants' },
    { to: '/submissions', icon: FileText, text: 'Submissions' },
    { to: '/researches', icon: BookOpen, text: 'Researches' },
  ]},
  { label: 'CREDENTIALS', items: [
    { to: '/certificates', icon: Award, text: 'Certificates' },
  ]},
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const { logoSrc } = useTheme();
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
        <img className="sidebar__brand-logo" src={logoSrc} alt="" aria-hidden="true" />
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
                <link.icon size={18} strokeWidth={2} />
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
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
