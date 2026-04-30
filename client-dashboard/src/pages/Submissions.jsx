import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Toast from '../components/Toast';
import { useConference } from '../components/ConferenceProvider';
import { fetchSubmissions, updateSubmissionStatus, deleteSubmission } from '../api';

const STATUSES = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'PUBLISHED'];

export default function Submissions() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [comment, setComment] = useState('');

  const load = () => { if (!selectedId) return; setLoading(true); fetchSubmissions(selectedId).then((r) => setItems(r.data)).catch(() => setItems([])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [selectedId]);

  const changeStatus = async (id, status) => {
    try {
      await updateSubmissionStatus(id, { status });
      load();
      setToast({ msg: `Status updated to ${status}`, type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const saveComment = async (id) => {
    try {
      await updateSubmissionStatus(id, { reviewComment: comment });
      load();
      setToast({ msg: 'Review comment saved.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;
    try {
      await deleteSubmission(id);
      load();
      setToast({ msg: 'Submission deleted successfully.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const filtered = items
    .filter((s) => filter === 'ALL' || s.status === filter)
    .filter((s) => s.paperTitle.toLowerCase().includes(search.toLowerCase()) || s.submissionId?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Submissions"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Submissions ({items.length})</span>
            <div className="table-toolbar__actions">
              <select className="conf-select" style={{minWidth:140}} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <div className="search-wrap"><input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>
          </div>
          {loading ? <div className="loader-wrap"><div className="loader" /></div> : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">📄</div><div className="empty-state__title">No submissions</div></div>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Theme</th><th>Authors</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <>
                    <tr key={s._id}>
                      <td><span className="badge badge--neutral">{s.submissionId}</span></td>
                      <td style={{maxWidth:250}}><strong>{s.paperTitle}</strong></td>
                      <td><span className="badge badge--accent">{s.themeId?.label || '—'}</span></td>
                      <td>{s.authors?.map((a) => a.fullName).join(', ')}</td>
                      <td>
                        <select className="form-select" style={{padding:'0.3rem 0.5rem',fontSize:'var(--fs-xs)',minWidth:120}} value={s.status} onChange={(e) => changeStatus(s._id, e.target.value)}>
                          {STATUSES.map((st) => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td>{new Date(s.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{display:'flex',gap:'0.4rem'}}>
                          <button className="btn btn--ghost btn--sm" onClick={() => { setExpandedId(expandedId === s._id ? null : s._id); setComment(s.reviewComment || ''); }}>
                            {expandedId === s._id ? 'Close' : 'Details'}
                          </button>
                          {s.pdfUrl && <a href={s.pdfUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">PDF</a>}
                          <button className="btn btn--danger btn--sm" onClick={() => handleDelete(s._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === s._id && (
                      <tr key={s._id + '-detail'}>
                        <td colSpan={7} style={{background:'var(--clr-surface-2)',padding:'var(--sp-lg)'}}>
                          <div className="detail-grid">
                            <div className="detail-item"><label>Institution</label><p>{s.institution || '—'}</p></div>
                            <div className="detail-item"><label>Country</label><p>{s.country || '—'}</p></div>
                          </div>
                          <div style={{marginBottom:'var(--sp-md)'}}>
                            <label style={{fontSize:'var(--fs-xs)',color:'var(--clr-text-muted)',fontWeight:600,textTransform:'uppercase'}}>Abstract</label>
                            <p style={{fontSize:'var(--fs-sm)',color:'var(--clr-text-dim)',marginTop:4,lineHeight:1.6}}>{s.abstract}</p>
                          </div>
                          <div style={{marginBottom:'var(--sp-md)'}}>
                            <label style={{fontSize:'var(--fs-xs)',color:'var(--clr-text-muted)',fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:4}}>Authors</label>
                            {s.authors?.map((a, i) => (
                              <div key={i} style={{fontSize:'var(--fs-sm)',color:'var(--clr-text-dim)',marginBottom:2}}>
                                {a.authorOrder}. {a.fullName} ({a.email}){a.isCorresponding && ' ⭐'} {a.affiliation && `— ${a.affiliation}`}
                              </div>
                            ))}
                          </div>
                          <div className="form-group" style={{maxWidth:500,marginBottom:'var(--sp-sm)'}}>
                            <label>Review Comment</label>
                            <textarea className="form-textarea" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                            <button className="btn btn--primary btn--sm" style={{alignSelf:'flex-start',marginTop:'var(--sp-sm)'}} onClick={() => saveComment(s._id)}>Save Comment</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {toast && <Toast key={Date.now()} message={toast.msg} type={toast.type} />}
    </>
  );
}
