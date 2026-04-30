import { useState } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import { useConference } from '../components/conferenceContext';
import { useAdminResearchesQuery } from '../hooks/useAdminQueries';
import { BookOpen, FileText } from 'lucide-react';

const STATUS_STYLE = {
  ACCEPTED: 'success',
  PUBLISHED: 'accent',
};

export default function Researches() {
  const { selectedId } = useConference();
  const { data: items = [], isLoading: loading } = useAdminResearchesQuery(selectedId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expanded, setExpanded] = useState(null);

  const filtered = items
    .filter((s) => statusFilter === 'ALL' || s.status === statusFilter)
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        s.paperTitle?.toLowerCase().includes(q) ||
        s.submissionId?.toLowerCase().includes(q) ||
        s.authors?.some((a) => a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
      );
    });

  const correspondingAuthor = (authors) => {
    const ca = authors?.find((a) => a.isCorresponding);
    return ca || authors?.[0] || null;
  };

  return (
    <>
      <Topbar title="Researches"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <div>
              <span className="table-toolbar__title">Accepted & Published Papers ({filtered.length})</span>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                Only submissions with status <strong>ACCEPTED</strong> or <strong>PUBLISHED</strong> appear here.
              </p>
            </div>
            <div className="table-toolbar__actions">
              <select className="conf-select" style={{ minWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
              <div className="search-wrap">
                <input className="search-input" placeholder="Search title/author…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="loader-wrap"><div className="loader" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><BookOpen size={48} strokeWidth={1.5} /></div>
              <div className="empty-state__title">No accepted or published papers</div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-sm)' }}>
                Accept or publish submissions from the Submissions page to see them here.
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Paper Title</th>
                  <th>Corresponding Author</th>
                  <th>Institution</th>
                  <th>Theme</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>PDF</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const ca = correspondingAuthor(s.authors);
                  return (
                    <>
                      <tr key={s._id}>
                        <td><span className="badge badge--neutral">{s.submissionId}</span></td>
                        <td><strong>{s.paperTitle}</strong></td>
                        <td>
                          {ca ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{ca.fullName}</div>
                              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)' }}>{ca.email}</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td>{s.institution || '—'}</td>
                        <td>
                          {s.themeId ? (
                            <span className="badge badge--primary">{s.themeId.code || s.themeId.label}</span>
                          ) : '—'}
                        </td>
                        <td><span className={`badge badge--${STATUS_STYLE[s.status] || 'neutral'}`}>{s.status}</span></td>
                        <td>{new Date(s.submittedAt).toLocaleDateString()}</td>
                        <td>
                          {s.pdfUrl ? (
                            <a href={s.pdfUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm"><FileText size={14} strokeWidth={2} /> View</a>
                          ) : '—'}
                        </td>
                        <td>
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setExpanded(expanded === s._id ? null : s._id)}
                          >
                            {expanded === s._id ? '▲' : '▼'}
                          </button>
                        </td>
                      </tr>
                      {expanded === s._id && (
                        <tr key={`${s._id}-exp`} className="expanded-row">
                          <td colSpan={9} style={{ padding: 'var(--sp-md) var(--sp-lg)', background: 'var(--clr-surface-2)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-lg)' }}>
                              <div>
                                <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, marginBottom: 'var(--sp-sm)', color: 'var(--clr-text-dim)' }}>Abstract</h4>
                                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.6, color: 'var(--clr-text-muted)' }}>{s.abstract || 'No abstract'}</p>
                              </div>
                              <div>
                                <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, marginBottom: 'var(--sp-sm)', color: 'var(--clr-text-dim)' }}>All Authors ({s.authors?.length || 0})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xs)' }}>
                                  {s.authors?.sort((a, b) => a.authorOrder - b.authorOrder).map((a, i) => (
                                    <div key={i} style={{ fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
                                      <span style={{ fontWeight: 600 }}>#{a.authorOrder}</span>
                                      <span>{a.fullName}</span>
                                      <span style={{ color: 'var(--clr-text-muted)' }}>({a.email})</span>
                                      {a.isCorresponding && <span className="badge badge--success" style={{ fontSize: '0.65rem' }}>Corresponding</span>}
                                    </div>
                                  ))}
                                </div>
                                {s.reviewComment && (
                                  <div style={{ marginTop: 'var(--sp-md)' }}>
                                    <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, marginBottom: 'var(--sp-xs)', color: 'var(--clr-text-dim)' }}>Review Comment</h4>
                                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--clr-text-muted)' }}>{s.reviewComment}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
