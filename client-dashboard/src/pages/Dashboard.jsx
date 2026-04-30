import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import { useConference } from '../components/conferenceContext';
import { useDashboardStatsQuery } from '../hooks/useAdminQueries';
import {
  Mic2, CalendarDays, FileText, ClipboardList,
  CheckCircle2, Award, Building2,
} from 'lucide-react';

const iconMap = {
  Speakers: Mic2,
  Sessions: CalendarDays,
  Submissions: FileText,
  Registrations: ClipboardList,
  Confirmed: CheckCircle2,
  Certificates: Award,
};

export default function Dashboard() {
  const { selectedId, selected, loading: confLoading } = useConference();
  const { data: stats = null, isLoading } = useDashboardStatsQuery(selectedId);

  const cards = stats
    ? [
        { label: 'Speakers', value: stats.totalSpeakers, variant: 'primary' },
        { label: 'Sessions', value: stats.totalSessions, variant: 'accent' },
        { label: 'Submissions', value: stats.totalSubmissions, variant: 'warning' },
        { label: 'Registrations', value: stats.totalRegistrations, variant: 'success' },
        { label: 'Confirmed', value: stats.confirmedRegistrations, variant: 'success' },
        { label: 'Certificates', value: stats.totalCertificates, variant: 'primary' },
      ]
    : [];

  const submissionBreakdown = stats?.submissionsByStatus || {};

  return (
    <>
      <Topbar title="Dashboard">
        <ConferenceSelector />
      </Topbar>
      <div className="page-content fade-in">
        {confLoading || isLoading ? (
          <div className="loader-wrap"><div className="loader" /></div>
        ) : !selected ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Building2 size={48} strokeWidth={1.5} /></div>
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
              {cards.map((c) => {
                const Icon = iconMap[c.label];
                return (
                  <div className="stat-card" key={c.label}>
                    <div className={`stat-card__icon stat-card__icon--${c.variant}`}>
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <div className="stat-card__value">{c.value}</div>
                    <div className="stat-card__label">{c.label}</div>
                  </div>
                );
              })}
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
