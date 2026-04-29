import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import { useConference } from '../components/ConferenceProvider';
import { fetchDashboardStats } from '../api';

export default function Dashboard() {
  const { selectedId, selected, loading: confLoading } = useConference();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetchDashboardStats(selectedId)
      .then((res) => setStats(res.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const cards = stats
    ? [
        { icon: '🎤', label: 'Speakers', value: stats.totalSpeakers, variant: 'primary' },
        { icon: '📅', label: 'Sessions', value: stats.totalSessions, variant: 'accent' },
        { icon: '📄', label: 'Submissions', value: stats.totalSubmissions, variant: 'warning' },
        { icon: '📝', label: 'Registrations', value: stats.totalRegistrations, variant: 'success' },
        { icon: '✅', label: 'Confirmed', value: stats.confirmedRegistrations, variant: 'success' },
        { icon: '🎓', label: 'Certificates', value: stats.totalCertificates, variant: 'primary' },
      ]
    : [];

  const submissionBreakdown = stats?.submissionsByStatus || {};

  return (
    <>
      <Topbar title="Dashboard">
        <ConferenceSelector />
      </Topbar>
      <div className="page-content fade-in">
        {confLoading || loading ? (
          <div className="loader-wrap"><div className="loader" /></div>
        ) : !selected ? (
          <div className="empty-state">
            <div className="empty-state__icon">🏛️</div>
            <div className="empty-state__title">No conference selected</div>
            <p>Create a conference to get started.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 'var(--sp-lg)' }}>
              <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{selected.name}</h2>
              <p style={{ color: 'var(--clr-text-dim)', fontSize: 'var(--fs-sm)' }}>
                {selected.venue && `${selected.venue}, `}{selected.city}{selected.country && `, ${selected.country}`}
                {' · '}
                {new Date(selected.startDate).toLocaleDateString()} – {new Date(selected.endDate).toLocaleDateString()}
              </p>
            </div>

            <div className="stats-grid">
              {cards.map((c) => (
                <div className="stat-card" key={c.label}>
                  <div className={`stat-card__icon stat-card__icon--${c.variant}`}>{c.icon}</div>
                  <div className="stat-card__value">{c.value}</div>
                  <div className="stat-card__label">{c.label}</div>
                </div>
              ))}
            </div>

            {Object.keys(submissionBreakdown).length > 0 && (
              <div className="table-wrap" style={{ maxWidth: 500 }}>
                <div className="table-toolbar">
                  <span className="table-toolbar__title">Submissions Breakdown</span>
                </div>
                <table>
                  <thead>
                    <tr><th>Status</th><th>Count</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(submissionBreakdown).map(([status, count]) => (
                      <tr key={status}>
                        <td><span className={`badge badge--${statusBadge(status)}`}>{status.replace('_', ' ')}</span></td>
                        <td><strong>{count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function statusBadge(s) {
  const map = { PENDING: 'warning', UNDER_REVIEW: 'accent', ACCEPTED: 'success', REJECTED: 'danger', PUBLISHED: 'primary' };
  return map[s] || 'neutral';
}
