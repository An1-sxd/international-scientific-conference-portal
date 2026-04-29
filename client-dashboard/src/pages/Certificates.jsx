import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ConferenceSelector from '../components/ConferenceSelector';
import Toast from '../components/Toast';
import { useConference } from '../components/ConferenceProvider';
import { fetchCertificates, generateCertificatesBatch, uploadCertificatePdf, generateCertificatePdf } from '../api';

export default function Certificates() {
  const { selectedId } = useConference();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(null);

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    fetchCertificates(selectedId)
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [selectedId]);

  const batchGenerate = async () => {
    if (!confirm('Generate certificates for all confirmed attendees?')) return;
    setGenerating(true);
    try {
      const res = await generateCertificatesBatch(selectedId);
      const d = res.data;
      setToast({ msg: `Generated: ${d.generated}, Skipped: ${d.skipped}`, type: 'success' });
      load();
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    finally { setGenerating(false); }
  };

  const handleUpload = async (certId, file) => {
    setUploading(certId);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      await uploadCertificatePdf(certId, fd);
      setToast({ msg: 'Certificate PDF uploaded!', type: 'success' });
      load();
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    finally { setUploading(null); }
  };

  const handleGeneratePdf = async (certId) => {
    setGeneratingPdf(certId);
    try {
      await generateCertificatePdf(certId);
      setToast({ msg: 'Certificate PDF generated & uploaded to CDN!', type: 'success' });
      load();
    } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    finally { setGeneratingPdf(null); }
  };

  const statusBadge = (s) => {
    const m = { GENERATED: 'warning', ISSUED: 'success', DOWNLOADED: 'primary', REVOKED: 'danger' };
    return m[s] || 'neutral';
  };

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return c.ownerName?.toLowerCase().includes(q) || c.ownerEmail?.toLowerCase().includes(q) || c.certificateId?.toLowerCase().includes(q);
  });

  return (
    <>
      <Topbar title="Certificates"><ConferenceSelector /></Topbar>
      <div className="page-content fade-in">
        {/* Actions bar */}
        <div className="table-wrap" style={{ marginBottom: 'var(--sp-xl)' }}>
          <div className="table-toolbar">
            <div>
              <span className="table-toolbar__title">Certificate Management</span>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                Mark participants as present in the Registrations page, then generate certificates. PDFs are auto-generated and stored on CDN.
              </p>
            </div>
            <div className="table-toolbar__actions">
              <button
                className="btn btn--primary"
                onClick={batchGenerate}
                disabled={generating}
              >
                {generating ? 'Generating…' : '🎓 Generate All Certificates'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar__title">Generated Certificates ({items.length})</span>
            <div className="table-toolbar__actions">
              <div className="search-wrap">
                <input className="search-input" placeholder="Search name/email/ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="loader-wrap"><div className="loader" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🎓</div>
              <div className="empty-state__title">No certificates generated</div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-sm)' }}>
                Mark participants as present in the Registrations page, then click "Generate All Certificates".
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Certificate ID</th>
                  <th>Participant</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Issue Date</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td><span className="badge badge--neutral">{c.certificateId}</span></td>
                    <td><strong>{c.ownerName}</strong></td>
                    <td>{c.ownerEmail}</td>
                    <td><span className="badge badge--accent">{c.certificateType}</span></td>
                    <td><span className={`badge badge--${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td><code style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-accent-h)', background: 'var(--clr-surface-2)', padding: '2px 6px', borderRadius: 'var(--r-sm)' }}>{c.verificationCode}</code></td>
                    <td>{new Date(c.issueDate).toLocaleDateString()}</td>
                    <td>
                      {c.pdfUrl ? (
                        <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="btn btn--success btn--sm">View / Download</a>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn--primary btn--sm"
                            onClick={() => handleGeneratePdf(c._id)}
                            disabled={generatingPdf === c._id}
                          >
                            {generatingPdf === c._id ? 'Generating…' : '⚡ Auto Generate'}
                          </button>
                          <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
                            {uploading === c._id ? 'Uploading…' : '📎 Upload'}
                            <input
                              type="file"
                              accept=".pdf"
                              style={{ display: 'none' }}
                              onChange={(e) => { if (e.target.files[0]) handleUpload(c._id, e.target.files[0]); }}
                              disabled={uploading === c._id}
                            />
                          </label>
                        </div>
                      )}
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
