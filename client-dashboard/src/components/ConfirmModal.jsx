import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Delete', loading = false }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{title || 'Confirm Action'}</h2>
          <button className="modal__close" onClick={onCancel}><X size={18} strokeWidth={2} /></button>
        </div>
        <div className="modal__body">
          <div className="confirm-modal__content">
            <div className="confirm-modal__icon">
              <AlertTriangle size={28} strokeWidth={2} />
            </div>
            <p className="confirm-modal__message">{message}</p>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
