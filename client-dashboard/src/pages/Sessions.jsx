import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useConference } from '../components/ConferenceProvider';
import { fetchSessions, createSession, updateSession, deleteSession, fetchThemes, fetchSpeakers } from '../api';
import { CalendarDays } from 'lucide-react';
import useFormValidation from '../hooks/useFormValidation';

const empty = { sessionTitle: '', themeId: '', speakerId: '', startsAt: '', endsAt: '', room: '', description: '' };

export default function Sessions() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [themes, setThemes] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { touched, errors, touchField, validate, groupClass, resetValidation } = useFormValidation();

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    Promise.all([fetchSessions(selectedId), fetchThemes(selectedId), fetchSpeakers(selectedId)])
      .then(([s, t, sp]) => { setItems(s.data); setThemes(t.data); setSpeakers(sp.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [selectedId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';

  const openAdd = () => { setForm(empty); setEditId(null); resetValidation(); setModal('add'); };
  const openEdit = (s) => {
    setForm({ sessionTitle: s.sessionTitle, themeId: s.themeId?._id || s.themeId || '', speakerId: s.speakerId?._id || s.speakerId || '', startsAt: fmt(s.startsAt), endsAt: fmt(s.endsAt), room: s.room || '', description: s.description || '' });
    setEditId(s._id); resetValidation(); setModal('edit');
  };

  const save = async () => {
    if (!validate(form, { sessionTitle: { required: true }, startsAt: { required: true }, endsAt: { required: true } })) return;
    try {
      const body = { ...form };
      if (!body.speakerId) delete body.speakerId;
      if (modal === 'add') await createSession(selectedId, body);
      else await updateSession(editId, body);
      setModal(null); load();
      setToast({ msg: modal === 'add' ? 'Session created!' : 'Session updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteSession(confirmTarget);
      setConfirmTarget(null);
      load();
      setToast({ msg: 'Session deleted.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    finally { setDeleting(false); }
  };

  const filtered = items.filter((s) => s.sessionTitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Sessions"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Sessions ({items.length})</span>
            <div className="table-toolbar__actions">
              <div className="search-wrap"><input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <button className="btn btn--primary btn--sm" onClick={openAdd}>+ Add Session</button>
            </div>
          </div>
          {loading ? <div className="loader-wrap"><div className="loader" /></div> : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon"><CalendarDays size={48} strokeWidth={1.5} /></div><div className="empty-state__title">No sessions</div></div>
          ) : (
            <table>
              <thead><tr><th>Title</th><th>Theme</th><th>Speaker</th><th>Start</th><th>End</th><th>Room</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.sessionTitle}</strong></td>
                    <td><span className="badge badge--accent">{s.themeId?.label || '—'}</span></td>
                    <td>{s.speakerId?.fullName || '—'}</td>
                    <td>{new Date(s.startsAt).toLocaleString([], {dateStyle:'short',timeStyle:'short'})}</td>
                    <td>{new Date(s.endsAt).toLocaleString([], {dateStyle:'short',timeStyle:'short'})}</td>
                    <td>{s.room || '—'}</td>
                    <td><div style={{display:'flex',gap:'0.4rem'}}><button className="btn btn--ghost btn--sm" onClick={() => openEdit(s)}>Edit</button><button className="btn btn--danger btn--sm" onClick={() => setConfirmTarget(s._id)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Session' : 'Edit Session'} onClose={() => setModal(null)}
          footer={<><button className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn--primary" onClick={save}>Save</button></>}>
          <div className={groupClass('sessionTitle')}><label>Session Title *</label><input className="form-input" value={form.sessionTitle} onChange={(e) => set('sessionTitle', e.target.value)} onBlur={() => touchField('sessionTitle', form.sessionTitle, { required: true })} />{touched.sessionTitle && errors.sessionTitle && <span className="form-error">{errors.sessionTitle}</span>}</div>
          <div className="form-row">
            <div className="form-group"><label>Theme *</label>
              <select className="form-select" value={form.themeId} onChange={(e) => set('themeId', e.target.value)}>
                <option value="">Select theme…</option>
                {themes.map((t) => <option key={t._id} value={t._id}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Speaker</label>
              <select className="form-select" value={form.speakerId} onChange={(e) => set('speakerId', e.target.value)}>
                <option value="">None</option>
                {speakers.map((sp) => <option key={sp._id} value={sp._id}>{sp.fullName}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className={groupClass('startsAt')}><label>Starts At *</label><input className="form-input" type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} onBlur={() => touchField('startsAt', form.startsAt, { required: true })} />{touched.startsAt && errors.startsAt && <span className="form-error">{errors.startsAt}</span>}</div>
            <div className={groupClass('endsAt')}><label>Ends At *</label><input className="form-input" type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} onBlur={() => touchField('endsAt', form.endsAt, { required: true })} />{touched.endsAt && errors.endsAt && <span className="form-error">{errors.endsAt}</span>}</div>
          </div>
          <div className="form-group"><label>Room</label><input className="form-input" value={form.room} onChange={(e) => set('room', e.target.value)} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        </Modal>
      )}
      {confirmTarget && (
        <ConfirmModal
          title="Delete Session"
          message="Are you sure you want to delete this session? This action cannot be undone."
          confirmText="Delete"
          loading={deleting}
          onConfirm={remove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {toast && <Toast key={Date.now()} message={toast.msg} type={toast.type} />}
    </>
  );
}
