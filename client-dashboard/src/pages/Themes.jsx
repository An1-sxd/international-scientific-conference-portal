import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useConference } from '../components/ConferenceProvider';
import { fetchThemes, createTheme, updateTheme, deleteTheme } from '../api';

const empty = { code: '', label: '', description: '', displayOrder: 0 };

export default function Themes() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => { if (!selectedId) return; setLoading(true); fetchThemes(selectedId).then((r) => setItems(r.data)).catch(() => setItems([])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [selectedId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => { setForm(empty); setEditId(null); setModal('add'); };
  const openEdit = (t) => { setForm({ code: t.code, label: t.label, description: t.description || '', displayOrder: t.displayOrder }); setEditId(t._id); setModal('edit'); };

  const save = async () => {
    try {
      if (modal === 'add') await createTheme(selectedId, form);
      else await updateTheme(editId, form);
      setModal(null); load();
      setToast({ msg: modal === 'add' ? 'Theme created!' : 'Theme updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this theme?')) return;
    try { await deleteTheme(id); load(); setToast({ msg: 'Theme deleted.', type: 'success' }); } catch (e) { setToast({ msg: e.message, type: 'error' }); }
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
            <div className="empty-state"><div className="empty-state__icon">🏷️</div><div className="empty-state__title">No themes</div></div>
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
                    <td><div style={{display:'flex',gap:'0.4rem'}}><button className="btn btn--ghost btn--sm" onClick={() => openEdit(t)}>Edit</button><button className="btn btn--danger btn--sm" onClick={() => remove(t._id)}>Delete</button></div></td>
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
            <div className="form-group"><label>Code *</label><input className="form-input" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. AI" /></div>
            <div className="form-group"><label>Display Order</label><input className="form-input" type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} /></div>
          </div>
          <div className="form-group"><label>Label *</label><input className="form-input" value={form.label} onChange={(e) => set('label', e.target.value)} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        </Modal>
      )}
      {toast && <Toast key={Date.now()} message={toast.msg} type={toast.type} />}
    </>
  );
}
