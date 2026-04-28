import { useState } from "react";
import { checkCertificate } from "../../api";
import "./VerifyCertificate.css";

export default function VerifyCertificate() {
  const [mode, setMode] = useState("certId");
  const [certificateId, setCertificateId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params =
        mode === "certId"
          ? { certificateId }
          : { verificationCode };
      const res = await checkCertificate(params);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section fade-in">
      <div className="container">
        <h1 className="section__title">Verify Certificate</h1>
        <p className="section__subtitle">
          Verify the authenticity of a conference certificate by entering its ID or verification code.
        </p>

        <div className="verify-card" id="verify-certificate-form">
          <div className="track-card__tabs">
            <button
              className={`track-card__tab ${mode === "certId" ? "track-card__tab--active" : ""}`}
              onClick={() => setMode("certId")}
            >
              By Certificate ID
            </button>
            <button
              className={`track-card__tab ${mode === "code" ? "track-card__tab--active" : ""}`}
              onClick={() => setMode("code")}
            >
              By Verification Code
            </button>
          </div>

          <form onSubmit={handleSearch} className="track-card__form">
            {mode === "certId" ? (
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
              {loading ? "Verifying…" : "Verify Certificate"}
            </button>
          </form>

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
