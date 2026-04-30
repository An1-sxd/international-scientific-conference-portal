import { useState } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useConference } from '../components/conferenceContext';
import {
  useAdminParticipantsQuery,
  useDeleteParticipantMutation,
  useUpdateParticipantMutation,
  useUpdateRegistrationStatusMutation,
} from '../hooks/useAdminQueries';
import { Users } from 'lucide-react';
import useFormValidation from '../hooks/useFormValidation';

const TYPES = ['STUDENT', 'RESEARCHER', 'PROFESSOR', 'GUEST', 'INDUSTRY'];

export default function Participants() {
  const { selectedId } = useConference();
  const { data: items = [], isLoading: loading } = useAdminParticipantsQuery(selectedId);
  const updateParticipantMutation = useUpdateParticipantMutation(selectedId);
  const deleteParticipantMutation = useDeleteParticipantMutation(selectedId);
  const updateRegistrationMutation = useUpdateRegistrationStatusMutation(selectedId);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const { touched, errors, touchField, validate, groupClass, resetValidation } = useFormValidation();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (p) => {
    setForm({ fullName: p.fullName, email: p.email, phone: p.phone || '', affiliation: p.affiliation || '', country: p.country || '', participantType: p.participantType });
    setEditId(p._id); resetValidation(); setModal(true);
  };

  const save = async () => {
    if (!validate(form, { fullName: { required: true }, email: { required: true, email: true }, phone: { phone: true } })) return;
    try {
      await updateParticipantMutation.mutateAsync({ id: editId, body: form });
      setModal(false);
      setToast({ msg: 'Participant updated!', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const remove = async () => {
    if (!confirmTarget) return;
    try {
      await deleteParticipantMutation.mutateAsync(confirmTarget);
      setConfirmTarget(null);
      setToast({ msg: 'Participant deleted.', type: 'success' });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const togglePresence = async (p) => {
    try {
      await updateRegistrationMutation.mutateAsync({ id: p.registrationRef, body: { attendanceConfirmed: !p.attendanceConfirmed } });
      setToast({
        msg: p.attendanceConfirmed ? `${p.fullName} marked as absent` : `${p.fullName} marked as present`,
        type: 'success',
      });
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
  };

  const filtered = items
    .filter((p) => typeFilter === 'ALL' || p.participantType === typeFilter)
    .filter((p) => {
      const q = search.toLowerCase();
      return p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });

  const presentCount = items.filter((p) => p.attendanceConfirmed).length;

  return (
    <>
      <Topbar title="Participants"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        <div className="table-wrap">
          <div className="table-toolbar">
            <div>
              <span className="table-toolbar__title">Accepted Participants ({filtered.length})</span>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                {presentCount} present · {items.length - presentCount} absent · {items.length} total
              </p>
            </div>
            <div className="table-toolbar__actions">
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
            <div className="empty-state"><div className="empty-state__icon"><Users size={48} strokeWidth={1.5} /></div><div className="empty-state__title">No accepted participants for this conference</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 70 }}>Present</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Affiliation</th>
                  <th>Type</th>
                  <th>Reg ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="attendance-check"
                        checked={p.attendanceConfirmed}
                        onChange={() => togglePresence(p)}
                        title={p.attendanceConfirmed ? 'Mark as absent' : 'Mark as present'}
                      />
                    </td>
                    <td><strong>{p.fullName}</strong></td>
                    <td>{p.email}</td>
                    <td>{p.affiliation || '—'}</td>
                    <td><span className="badge badge--accent">{p.participantType}</span></td>
                    <td><span className="badge badge--neutral">{p.registrationId}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn--danger btn--sm" onClick={() => setConfirmTarget(p._id)}>Delete</button>
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
            <div className={groupClass('fullName')}><label>Full Name *</label><input className="form-input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} onBlur={() => touchField('fullName', form.fullName, { required: true })} />{touched.fullName && errors.fullName && <span className="form-error">{errors.fullName}</span>}</div>
            <div className={groupClass('email')}><label>Email *</label><input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => touchField('email', form.email, { required: true, email: true })} />{touched.email && errors.email && <span className="form-error">{errors.email}</span>}</div>
          </div>
          <div className="form-row">
            <div className={groupClass('phone')}><label>Phone</label><input className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => touchField('phone', form.phone, { phone: true })} />{touched.phone && errors.phone && <span className="form-error">{errors.phone}</span>}</div>
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
      {confirmTarget && (
        <ConfirmModal
          title="Delete Participant"
          message="Are you sure you want to delete this participant and all related data? This action cannot be undone."
          confirmText="Delete"
          loading={deleteParticipantMutation.isPending}
          onConfirm={remove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {toast && <Toast key={Date.now()} message={toast.msg} type={toast.type} />}
    </>
  );
}
