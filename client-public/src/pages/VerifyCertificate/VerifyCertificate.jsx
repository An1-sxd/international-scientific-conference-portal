import { useState } from "react";
import { checkCertificateStatus } from "../../api";
import "./VerifyCertificate.css";

export default function VerifyCertificate() {
  const [mode, setMode] = useState("id");
  const [registrationId, setRegistrationId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const params = mode === "id" ? { registrationId } : { email };
      const res = await checkCertificateStatus(params);
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (newMode) => {
    setMode(newMode);
    setResults(null);
    setError(null);
  };

  return (
    <div className="section fade-in">
      <div className="container">
        <h1 className="section__title">Certificate Status</h1>
        <p className="section__subtitle">
          Check your certificate status using your registration ID or email address.
        </p>

        <div className="verify-card" id="verify-certificate-form">
          <div className="track-card__tabs">
            <button
              className={`track-card__tab ${mode === "id" ? "track-card__tab--active" : ""}`}
              onClick={() => resetForm("id")}
            >
              By Registration ID
            </button>
            <button
              className={`track-card__tab ${mode === "email" ? "track-card__tab--active" : ""}`}
              onClick={() => resetForm("email")}
            >
              By Email
            </button>
          </div>

          <form onSubmit={handleSearch} className="track-card__form">
            {mode === "id" ? (
              <div className="form-group">
                <label htmlFor="cert-reg-id">Registration ID</label>
                <input
                  id="cert-reg-id"
                  className="form-input"
                  placeholder="e.g. REG-2026-0001"
                  required
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="cert-email">Email Address</label>
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
            )}

            {error && <div className="track-card__error">{error}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Checking…" : "Check Certificate Status"}
            </button>
          </form>

          {/* ── Results ── */}
          {results && results.length > 0 && (
            <div className="cert-results" id="certificate-results">
              {results.map((entry, i) => (
                <div
                  className={`cert-status-card cert-status-card--${entry.certificateStatus}`}
                  key={i}
                >
                  {/* Header */}
                  <div className="cert-status-card__header">
                    <div>
                      <h3 className="cert-status-card__conf">
                        {entry.conferenceName || "Conference"}
                      </h3>
                      <span className="cert-status-card__meta">
                        {entry.venue && `${entry.venue}, `}
                        {entry.city}
                        {entry.startDate &&
                          ` · ${new Date(entry.startDate).toLocaleDateString()}`}
                      </span>
                    </div>
                    <span className="cert-status-card__reg-id">
                      {entry.registrationId}
                    </span>
                  </div>

                  {/* Body — status-specific content */}
                  <div className="cert-status-card__body">
                    {entry.certificateStatus === "not_accepted" && (
                      <div className="cert-status-msg cert-status-msg--danger">
                        <span className="cert-status-msg__icon">✕</span>
                        <div>
                          <strong>Registration Cancelled</strong>
                          <p>
                            Your registration for this conference has been cancelled.
                            You are not accepted in this conference.
                          </p>
                        </div>
                      </div>
                    )}

                    {entry.certificateStatus === "not_ready" && (
                      <div className="cert-status-msg cert-status-msg--warning">
                        <span className="cert-status-msg__icon">⏳</span>
                        <div>
                          <strong>Certificate Not Ready</strong>
                          <p>
                            Your registration is confirmed, but your attendance has
                            not been marked yet. Your certificate will be available
                            once the organizer confirms your presence at the
                            conference.
                          </p>
                        </div>
                      </div>
                    )}

                    {entry.certificateStatus === "ready" && (
                      <>
                        <div className="cert-status-msg cert-status-msg--success">
                          <span className="cert-status-msg__icon">✓</span>
                          <div>
                            <strong>Certificate Ready!</strong>
                            <p>
                              Your attendance has been confirmed. Your certificate is
                              ready to view and download.
                            </p>
                          </div>
                        </div>

                        {entry.certificate && (
                          <div className="cert-status-card__details">
                            <div className="cert-status-card__info-grid">
                              <div>
                                <span className="cert-status-card__label">
                                  Certificate ID
                                </span>
                                <span className="cert-status-card__value">
                                  {entry.certificate.certificateId}
                                </span>
                              </div>
                              <div>
                                <span className="cert-status-card__label">
                                  Verification Code
                                </span>
                                <span className="cert-status-card__value">
                                  {entry.certificate.verificationCode}
                                </span>
                              </div>
                              <div>
                                <span className="cert-status-card__label">
                                  Status
                                </span>
                                <span className="badge badge--success">
                                  {entry.certificate.status}
                                </span>
                              </div>
                              <div>
                                <span className="cert-status-card__label">
                                  Issue Date
                                </span>
                                <span className="cert-status-card__value">
                                  {new Date(
                                    entry.certificate.issueDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            {entry.certificate.pdfUrl && (
                              <div className="cert-status-card__actions">
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
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
