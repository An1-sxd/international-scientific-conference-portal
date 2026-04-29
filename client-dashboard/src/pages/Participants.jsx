import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useConference } from '../components/ConferenceProvider';
import { fetchParticipants, updateParticipant, deleteParticipant, updateRegistrationStatus } from '../api';

const TYPES = ['STUDENT', 'RESEARCHER', 'PROFESSOR', 'GUEST', 'INDUSTRY'];

export default function Participants() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [presenceFilter, setPresenceFilter] = useState('ALL');

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    fetchParticipants(selectedId)
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [selectedId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (p) => {
    setForm({ fullName: p.fullName, email: p.email, phone: p.phone || '', affiliation: p.affiliation || '', country: p.country || '', participantType: p.participantType });
    setEditId(p._id); setModal(true);
  };

  const save = async () => {
    try {
      await updateParticipant(editId, form);
      setModal(false); load();
      setToast({ msg: 'Participant updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this participant?')) return;
    try { await deleteParticipant(id); load(); setToast({ msg: 'Participant deleted.', type: 'success' }); } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const togglePresence = async (p) => {
    try {
      await updateRegistrationStatus(p.registrationRef, { attendanceConfirmed: !p.attendanceConfirmed });
      load();
      setToast({
        msg: p.attendanceConfirmed ? `${p.fullName} marked as absent` : `${p.fullName} marked as present ✓`,
        type: 'success',
      });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const filtered = items
    .filter((p) => typeFilter === 'ALL' || p.participantType === typeFilter)
    .filter((p) => {
      if (presenceFilter === 'PRESENT') return p.attendanceConfirmed;
      if (presenceFilter === 'ABSENT') return !p.attendanceConfirmed;
      return true;
    })
    .filter((p) => {
      const q = search.toLowerCase();
      return p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });

  const presentCount = items.filter((p) => p.attendanceConfirmed).length;

  return (
    <>
      <Topbar title="Participants"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        {/* Summary bar */}
        <div className="table-wrap" style={{ marginBottom: 'var(--sp-xl)' }}>
          <div className="table-toolbar">
            <div>
              <span className="table-toolbar__title">Presence Overview</span>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                Mark participants as present using the checkboxes below. Certificates will only be available for present participants.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-lg)', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--clr-success)' }}>{presentCount}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--clr-text-muted)' }}>{items.length - presentCount}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>{items.length}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Participants ({filtered.length})</span>
            <div className="table-toolbar__actions">
              <select className="conf-select" style={{ minWidth: 130 }} value={presenceFilter} onChange={(e) => setPresenceFilter(e.target.value)}>
                <option value="ALL">All Presence</option>
                <option value="PRESENT">Present Only</option>
                <option value="ABSENT">Absent Only</option>
              </select>
              <select className="conf-select" style={{ minWidth: 130 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="ALL">All Types</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="search-wrap">
                <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="loader-wrap"><div className="loader" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">👥</div><div className="empty-state__title">No participants for this conference</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Affiliation</th>
                  <th>Type</th>
                  <th>Reg Status</th>
                  <th style={{ textAlign: 'center' }}>Present</th>
                  <th>Certificate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.fullName}</strong></td>
                    <td>{p.email}</td>
                    <td>{p.affiliation || '—'}</td>
                    <td><span className="badge badge--accent">{p.participantType}</span></td>
                    <td>
                      <span className={`badge badge--${p.registrationStatus === 'CONFIRMED' ? 'success' : p.registrationStatus === 'CANCELLED' ? 'danger' : 'warning'}`}>
                        {p.registrationStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="attendance-check"
                        checked={p.attendanceConfirmed}
                        onChange={() => togglePresence(p)}
                        title={p.attendanceConfirmed ? 'Mark as absent' : 'Mark as present'}
                      />
                    </td>
                    <td>
                      <span className={`badge badge--${p.attendanceConfirmed ? 'success' : 'neutral'}`}>
                        {p.attendanceConfirmed ? '✓ Ready' : 'Not Ready'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn--danger btn--sm" onClick={() => remove(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Edit Participant" onClose={() => setModal(false)}
          footer={<><button className="btn btn--ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn--primary" onClick={save}>Save</button></>}>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input className="form-input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} /></div>
            <div className="form-group"><label>Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Phone</label><input className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            <div className="form-group"><label>Country</label><input className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Affiliation</label><input className="form-input" value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} /></div>
            <div className="form-group"><label>Type</label>
              <select className="form-select" value={form.participantType} onChange={(e) => set('participantType', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
      {toast && <Toast key={Date.now()} message={toast.msg} type={toast.type} />}
    </>
  );
}
