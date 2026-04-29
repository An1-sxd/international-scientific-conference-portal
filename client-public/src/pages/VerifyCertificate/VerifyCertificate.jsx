import { useState } from "react";
import { checkCertificate, fetchMyCertificates } from "../../api";
import "./VerifyCertificate.css";

export default function VerifyCertificate() {
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [myCerts, setMyCerts] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setMyCerts(null);
    try {
      if (mode === "email") {
        const res = await fetchMyCertificates(email);
        setMyCerts(res.data);
      } else {
        const params =
          mode === "certId"
            ? { certificateId }
            : { verificationCode };
        const res = await checkCertificate(params);
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section fade-in">
      <div className="container">
        <h1 className="section__title">Certificates</h1>
        <p className="section__subtitle">
          View your attendance certificates or verify a certificate's authenticity.
        </p>

        <div className="verify-card" id="verify-certificate-form">
          <div className="track-card__tabs">
            <button
              className={`track-card__tab ${mode === "email" ? "track-card__tab--active" : ""}`}
              onClick={() => { setMode("email"); setResult(null); setMyCerts(null); setError(null); }}
            >
              My Certificates
            </button>
            <button
              className={`track-card__tab ${mode === "certId" ? "track-card__tab--active" : ""}`}
              onClick={() => { setMode("certId"); setResult(null); setMyCerts(null); setError(null); }}
            >
              By Certificate ID
            </button>
            <button
              className={`track-card__tab ${mode === "code" ? "track-card__tab--active" : ""}`}
              onClick={() => { setMode("code"); setResult(null); setMyCerts(null); setError(null); }}
            >
              By Verification Code
            </button>
          </div>

          <form onSubmit={handleSearch} className="track-card__form">
            {mode === "email" ? (
              <div className="form-group">
                <label htmlFor="cert-email">Your Email Address</label>
                <input
                  id="cert-email"
                  className="form-input"
                  type="email"
                  placeholder="e.g. your.email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : mode === "certId" ? (
              <div className="form-group">
                <label htmlFor="cert-id">Certificate ID</label>
                <input
                  id="cert-id"
                  className="form-input"
                  placeholder="e.g. CERT-2026-0001"
                  required
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="cert-code">Verification Code</label>
                <input
                  id="cert-code"
                  className="form-input"
                  placeholder="e.g. ABC123XY"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
            )}

            {error && <div className="track-card__error">{error}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading
                ? mode === "email" ? "Loading certificates…" : "Verifying…"
                : mode === "email" ? "View My Certificates" : "Verify Certificate"}
            </button>
          </form>

          {/* ── My Certificates results ── */}
          {myCerts && (
            <div className="my-certs" id="my-certificates-results">
              {myCerts.length === 0 ? (
                <div className="verify-result">
                  <p style={{ textAlign: "center", color: "var(--clr-text-dim)" }}>
                    No registrations found for this email.
                  </p>
                </div>
              ) : (
                myCerts.map((entry, i) => (
                  <div className="cert-entry" key={i}>
                    <div className="cert-entry__header">
                      <div className="cert-entry__conf">
                        <h3>{entry.conferenceName}</h3>
                        <span className="cert-entry__meta">
                          {entry.venue && `${entry.venue}, `}{entry.city}
                          {entry.startDate && ` · ${new Date(entry.startDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      <span className={`badge ${entry.attendanceConfirmed ? "badge--success" : "badge--warning"}`}>
                        {entry.attendanceConfirmed ? "Present ✓" : "Not Confirmed"}
                      </span>
                    </div>

                    {entry.certificate ? (
                      <div className="cert-entry__body">
                        <div className="cert-entry__info-grid">
                          <div>
                            <span className="cert-entry__label">Certificate ID</span>
                            <span className="cert-entry__value">{entry.certificate.certificateId}</span>
                          </div>
                          <div>
                            <span className="cert-entry__label">Verification Code</span>
                            <span className="cert-entry__value">{entry.certificate.verificationCode}</span>
                          </div>
                          <div>
                            <span className="cert-entry__label">Status</span>
                            <span className="badge badge--success">{entry.certificate.status}</span>
                          </div>
                          <div>
                            <span className="cert-entry__label">Issue Date</span>
                            <span className="cert-entry__value">
                              {new Date(entry.certificate.issueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {entry.certificate.pdfUrl && (
                          <div className="cert-entry__actions">
                            <a
                              href={entry.certificate.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn--primary"
                            >
                              👁️ View Certificate
                            </a>
                            <a
                              href={entry.certificate.pdfUrl}
                              download
                              className="btn btn--outline"
                            >
                              ⬇️ Download PDF
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="cert-entry__body cert-entry__body--pending">
                        <p>⏳ Your attendance has not been confirmed yet for this conference. Certificate will be available once the admin marks you as present.</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Single certificate verification result ── */}
          {result && (
            <div className="verify-result" id="verify-result">
              <div className={`verify-result__status ${result.valid ? "verify-result__status--valid" : "verify-result__status--invalid"}`}>
                <span className="verify-result__status-icon">
                  {result.valid ? "✅" : "❌"}
                </span>
                <span className="verify-result__status-text">
                  {result.valid ? "Certificate is Valid" : "Certificate is Invalid / Revoked"}
                </span>
              </div>

              <div className="verify-result__details">
                <div className="track-result__row">
                  <span className="track-result__label">Certificate ID</span>
                  <span className="track-result__value">{result.certificateId}</span>
                </div>
                <div className="track-result__row">
                  <span className="track-result__label">Verification Code</span>
                  <span className="track-result__value">{result.verificationCode}</span>
                </div>
                <div className="track-result__row">
                  <span className="track-result__label">Type</span>
                  <span className="badge badge--accent">{result.certificateType}</span>
                </div>
                <div className="track-result__row">
                  <span className="track-result__label">Owner</span>
                  <span className="track-result__value">{result.ownerName}</span>
                </div>
                <div className="track-result__row">
                  <span className="track-result__label">Status</span>
                  <span className={`badge ${result.valid ? "badge--success" : "badge--danger"}`}>
                    {result.status}
                  </span>
                </div>
                <div className="track-result__row">
                  <span className="track-result__label">Issue Date</span>
                  <span className="track-result__value">
                    {new Date(result.issueDate).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>
                {result.conference && (
                  <div className="track-result__row">
                    <span className="track-result__label">Conference</span>
                    <span className="track-result__value">{result.conference.name}</span>
                  </div>
                )}
              </div>

              {result.pdfUrl && (
                <div className="verify-result__actions">
                  <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="btn btn--primary">
                    👁️ View Certificate
                  </a>
                  <a href={result.pdfUrl} download className="btn btn--outline">
                    ⬇️ Download PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
