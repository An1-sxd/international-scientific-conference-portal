import { useState } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Toast from '../components/Toast';
import { useConference } from '../components/conferenceContext';
import {
  useAdminRegistrationsQuery,
  useUpdateRegistrationStatusMutation,
} from '../hooks/useAdminQueries';
import { ClipboardList } from 'lucide-react';

const STATUSES = ['PENDING', 'ACCEPTED', 'REFUSED'];

export default function Registrations() {
  const { selectedId } = useConference();
  const { data: items = [], isLoading: loading } = useAdminRegistrationsQuery(selectedId);
  const updateStatusMutation = useUpdateRegistrationStatusMutation(selectedId);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const changeStatus = async (id, registrationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, body: { registrationStatus } });
      setToast({ msg: `Status → ${registrationStatus}`, type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const filtered = items
    .filter((r) => filter === 'ALL' || r.registrationStatus === filter)
    .filter((r) => {
      const name = r.participantId?.fullName?.toLowerCase() || '';
      const email = r.participantId?.email?.toLowerCase() || '';
      const q = search.toLowerCase();
      return name.includes(q) || email.includes(q) || (r.registrationId || '').toLowerCase().includes(q);
    });

  const statusBadge = (s) => {
    const m = { PENDING: 'warning', ACCEPTED: 'success', REFUSED: 'danger' };
    return m[s] || 'neutral';
  };

  return (
    <>
      <Topbar title="Registrations"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Registrations ({items.length})</span>
            <div className="table-toolbar__actions">
              <select className="conf-select" style={{ minWidth: 140 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="search-wrap">
                <input className="search-input" placeholder="Search name/email…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="loader-wrap"><div className="loader" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon"><ClipboardList size={48} strokeWidth={1.5} /></div><div className="empty-state__title">No registrations</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reg ID</th>
                  <th>Participant</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td><span className="badge badge--neutral">{r.registrationId}</span></td>
                    <td><strong>{r.participantId?.fullName || '—'}</strong></td>
                    <td>{r.participantId?.email || '—'}</td>
                    <td><span className="badge badge--accent">{r.participantId?.participantType || '—'}</span></td>
                    <td><span className={`badge badge--${statusBadge(r.registrationStatus)}`}>{r.registrationStatus}</span></td>
                    <td>{new Date(r.registeredAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.5rem', fontSize: 'var(--fs-xs)', minWidth: 110 }}
                        value={r.registrationStatus}
                        onChange={(e) => changeStatus(r._id, e.target.value)}
                      >
                        {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                  </tr>
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
