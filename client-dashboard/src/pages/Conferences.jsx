import { useState } from 'react';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useConference } from '../components/conferenceContext';
import {
  useAdminConferencesQuery,
  useCreateConferenceMutation,
  useDeleteConferenceMutation,
  useUpdateConferenceMutation,
} from '../hooks/useAdminQueries';
import { Building2 } from 'lucide-react';
import useFormValidation from '../hooks/useFormValidation';

const empty = { name: '', slogan: '', description: '', startDate: '', endDate: '', venue: '', city: '', country: '', contactEmail: '', isActive: true };

export default function Conferences() {
  const { refresh } = useConference();
  const { data: items = [], isLoading: loading } = useAdminConferencesQuery();
  const createMutation = useCreateConferenceMutation();
  const updateMutation = useUpdateConferenceMutation();
  const deleteMutation = useDeleteConferenceMutation();
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const { touched, errors, touchField, validate, groupClass, resetValidation } = useFormValidation();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(empty); setEditId(null); resetValidation(); setModal('add'); };
  const openEdit = (c) => {
    setForm({ ...c, startDate: c.startDate?.slice(0, 10), endDate: c.endDate?.slice(0, 10) });
    setEditId(c._id);
    resetValidation();
    setModal('edit');
  };

  const save = async () => {
    if (!validate(form, { name: { required: true }, startDate: { required: true }, endDate: { required: true } })) return;
    try {
      if (modal === 'add') await createMutation.mutateAsync(form);
      else await updateMutation.mutateAsync({ id: editId, body: form });
      setModal(null);
      await refresh();
      setToast({ msg: modal === 'add' ? 'Conference created!' : 'Conference updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async () => {
    if (!confirmTarget) return;
    try {
      await deleteMutation.mutateAsync(confirmTarget);
      setConfirmTarget(null);
      await refresh();
      setToast({ msg: 'Conference deleted.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const filtered = items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Conferences" />
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">All Conferences</span>
            <div className="table-toolbar__actions">
              <div className="search-wrap">
                <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="btn btn--primary btn--sm" onClick={openAdd}>+ Add Conference</button>
            </div>
          </div>
          {loading ? <div className="loader-wrap"><div className="loader" /></div> : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon"><Building2 size={48} strokeWidth={1.5} /></div><div className="empty-state__title">No conferences found</div></div>
          ) : (
            <table>
              <thead><tr><th>Name</th><th>Dates</th><th>Venue</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong>{c.slogan && <><br/><span style={{fontSize:'var(--fs-xs)',color:'var(--clr-text-muted)'}}>{c.slogan}</span></>}</td>
                    <td>{new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}</td>
                    <td>{c.venue}{c.city && `, ${c.city}`}</td>
                    <td><span className={`badge ${c.isActive ? 'badge--success' : 'badge--neutral'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{display:'flex',gap:'0.4rem'}}>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn--danger btn--sm" onClick={() => setConfirmTarget(c._id)}>Delete</button>
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
        <Modal title={modal === 'add' ? 'New Conference' : 'Edit Conference'} onClose={() => setModal(null)}
          footer={<><button className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn--primary" onClick={save}>Save</button></>}>
          <div className={groupClass('name')}><label>Name *</label><input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} onBlur={() => touchField('name', form.name, { required: true })} />{touched.name && errors.name && <span className="form-error">{errors.name}</span>}</div>
          <div className="form-group"><label>Slogan</label><input className="form-input" value={form.slogan} onChange={(e) => set('slogan', e.target.value)} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="form-row">
            <div className={groupClass('startDate')}><label>Start Date *</label><input className="form-input" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} onBlur={() => touchField('startDate', form.startDate, { required: true })} />{touched.startDate && errors.startDate && <span className="form-error">{errors.startDate}</span>}</div>
            <div className={groupClass('endDate')}><label>End Date *</label><input className="form-input" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} onBlur={() => touchField('endDate', form.endDate, { required: true })} />{touched.endDate && errors.endDate && <span className="form-error">{errors.endDate}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Venue</label><input className="form-input" value={form.venue} onChange={(e) => set('venue', e.target.value)} /></div>
            <div className="form-group"><label>City</label><input className="form-input" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Country</label><input className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} /></div>
            <div className="form-group"><label>Contact Email</label><input className="form-input" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label className="form-checkbox"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active</label>
          </div>
        </Modal>
      )}
      {confirmTarget && (
        <ConfirmModal
          title="Delete Conference"
          message="Are you sure you want to delete this conference? All related data (sessions, themes, registrations, etc.) may be affected. This action cannot be undone."
          confirmText="Delete"
          loading={deleteMutation.isPending}
          onConfirm={remove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {toast && <Toast key={Date.now()} message={toast.msg} type={toast.type} />}
    </>
  );
}
