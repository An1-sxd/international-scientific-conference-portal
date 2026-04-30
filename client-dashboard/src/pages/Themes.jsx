import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useConference } from '../components/ConferenceProvider';
import { fetchThemes, createTheme, updateTheme, deleteTheme } from '../api';
import { Tag } from 'lucide-react';
import useFormValidation from '../hooks/useFormValidation';

const empty = { code: '', label: '', description: '', displayOrder: 0 };

export default function Themes() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { touched, errors, touchField, validate, groupClass, resetValidation } = useFormValidation();

  const load = () => { if (!selectedId) return; setLoading(true); fetchThemes(selectedId).then((r) => setItems(r.data)).catch(() => setItems([])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [selectedId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => { setForm(empty); setEditId(null); resetValidation(); setModal('add'); };
  const openEdit = (t) => { setForm({ code: t.code, label: t.label, description: t.description || '', displayOrder: t.displayOrder }); setEditId(t._id); resetValidation(); setModal('edit'); };

  const save = async () => {
    if (!validate(form, { code: { required: true }, label: { required: true } })) return;
    try {
      if (modal === 'add') await createTheme(selectedId, form);
      else await updateTheme(editId, form);
      setModal(null); load();
      setToast({ msg: modal === 'add' ? 'Theme created!' : 'Theme updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteTheme(confirmTarget);
      setConfirmTarget(null);
      load();
      setToast({ msg: 'Theme deleted.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <Topbar title="Themes"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Themes ({items.length})</span>
            <div className="table-toolbar__actions">
              <button className="btn btn--primary btn--sm" onClick={openAdd}>+ Add Theme</button>
            </div>
          </div>
          {loading ? <div className="loader-wrap"><div className="loader" /></div> : items.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon"><Tag size={48} strokeWidth={1.5} /></div><div className="empty-state__title">No themes</div></div>
          ) : (
            <table>
              <thead><tr><th>Order</th><th>Code</th><th>Label</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id}>
                    <td><span className="badge badge--neutral">{t.displayOrder}</span></td>
                    <td><span className="badge badge--accent">{t.code}</span></td>
                    <td><strong>{t.label}</strong></td>
                    <td style={{maxWidth:300,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description || '—'}</td>
                    <td><div style={{display:'flex',gap:'0.4rem'}}><button className="btn btn--ghost btn--sm" onClick={() => openEdit(t)}>Edit</button><button className="btn btn--danger btn--sm" onClick={() => setConfirmTarget(t._id)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Theme' : 'Edit Theme'} onClose={() => setModal(null)}
          footer={<><button className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn--primary" onClick={save}>Save</button></>}>
          <div className="form-row">
            <div className={groupClass('code')}><label>Code *</label><input className="form-input" value={form.code} onChange={(e) => set('code', e.target.value)} onBlur={() => touchField('code', form.code, { required: true })} placeholder="e.g. AI" />{touched.code && errors.code && <span className="form-error">{errors.code}</span>}</div>
            <div className="form-group"><label>Display Order</label><input className="form-input" type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} /></div>
          </div>
          <div className={groupClass('label')}><label>Label *</label><input className="form-input" value={form.label} onChange={(e) => set('label', e.target.value)} onBlur={() => touchField('label', form.label, { required: true })} />{touched.label && errors.label && <span className="form-error">{errors.label}</span>}</div>
          <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        </Modal>
      )}
      {confirmTarget && (
        <ConfirmModal
          title="Delete Theme"
          message="Are you sure you want to delete this theme? This action cannot be undone."
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
