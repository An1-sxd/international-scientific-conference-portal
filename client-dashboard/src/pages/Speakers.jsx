import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import FileInput from '../components/FileInput';
import { useConference } from '../components/ConferenceProvider';
import { fetchSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from '../api';
import { Mic2 } from 'lucide-react';
import useFormValidation from '../hooks/useFormValidation';

const empty = { fullName: '', academicTitle: '', affiliation: '', country: '', topic: '', biography: '', email: '' };

export default function Speakers() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { touched, errors, touchField, validate, groupClass, resetValidation } = useFormValidation();

  const load = () => { if (!selectedId) return; setLoading(true); fetchSpeakers(selectedId).then((r) => setItems(r.data)).catch(() => setItems([])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [selectedId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(empty); setPhoto(null); setEditId(null); resetValidation(); setModal('add'); };
  const openEdit = (s) => { setForm({ fullName: s.fullName, academicTitle: s.academicTitle || '', affiliation: s.affiliation || '', country: s.country || '', topic: s.topic || '', biography: s.biography || '', email: s.email || '' }); setPhoto(null); setEditId(s._id); resetValidation(); setModal('edit'); };

  const save = async () => {
    if (!validate(form, { fullName: { required: true } })) return;
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (photo) fd.append('photo', photo);
      if (modal === 'add') await createSpeaker(selectedId, fd);
      else await updateSpeaker(editId, fd);
      setModal(null); load();
      setToast({ msg: modal === 'add' ? 'Speaker added!' : 'Speaker updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteSpeaker(confirmTarget);
      setConfirmTarget(null);
      load();
      setToast({ msg: 'Speaker deleted.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    finally { setDeleting(false); }
  };

  const filtered = items.filter((s) => s.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Speakers"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Speakers ({items.length})</span>
            <div className="table-toolbar__actions">
              <div className="search-wrap"><input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <button className="btn btn--primary btn--sm" onClick={openAdd}>+ Add Speaker</button>
            </div>
          </div>
          {loading ? <div className="loader-wrap"><div className="loader" /></div> : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon"><Mic2 size={48} strokeWidth={1.5} /></div><div className="empty-state__title">No speakers</div></div>
          ) : (
            <table>
              <thead><tr><th>Photo</th><th>Name</th><th>Title</th><th>Affiliation</th><th>Topic</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td>{s.photoUrl ? <img src={s.photoUrl} alt="" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}} /> : <div style={{width:36,height:36,borderRadius:'50%',background:'var(--clr-surface-2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Mic2 size={16} strokeWidth={2} /></div>}</td>
                    <td><strong>{s.fullName}</strong></td>
                    <td>{s.academicTitle || '—'}</td>
                    <td>{s.affiliation || '—'}</td>
                    <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.topic || '—'}</td>
                    <td><div style={{display:'flex',gap:'0.4rem'}}><button className="btn btn--ghost btn--sm" onClick={() => openEdit(s)}>Edit</button><button className="btn btn--danger btn--sm" onClick={() => setConfirmTarget(s._id)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Speaker' : 'Edit Speaker'} onClose={() => setModal(null)}
          footer={<><button className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn--primary" onClick={save}>Save</button></>}>
          <div className="form-row">
            <div className={groupClass('fullName')}><label>Full Name *</label><input className="form-input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} onBlur={() => touchField('fullName', form.fullName, { required: true })} />{touched.fullName && errors.fullName && <span className="form-error">{errors.fullName}</span>}</div>
            <div className="form-group"><label>Academic Title</label><input className="form-input" value={form.academicTitle} onChange={(e) => set('academicTitle', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Affiliation</label><input className="form-input" value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} /></div>
            <div className="form-group"><label>Country</label><input className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Topic</label><input className="form-input" value={form.topic} onChange={(e) => set('topic', e.target.value)} /></div>
          <div className="form-group"><label>Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div className="form-group"><label>Biography</label><textarea className="form-textarea" value={form.biography} onChange={(e) => set('biography', e.target.value)} /></div>
          <div className="form-group"><label>Photo</label><FileInput accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} /></div>
        </Modal>
      )}
      {confirmTarget && (
        <ConfirmModal
          title="Delete Speaker"
          message="Are you sure you want to delete this speaker? This action cannot be undone."
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
