import { useState } from "react";
import { trackRegistration } from "../../api";
import "./TrackRegistration.css";

const STATUS_STYLE = {
  PENDING: "badge--warning",
  ACCEPTED: "badge--success",
  REFUSED: "badge--danger",
};

export default function TrackRegistration() {
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
      const res = await trackRegistration(params);
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section fade-in">
      <div className="container">
        <h1 className="section__title">Track Your Registration</h1>
        <p className="section__subtitle">
          Enter your registration ID or email address to check your registration status.
        </p>

        <div className="track-card" id="track-registration-form">
          <div className="track-card__tabs">
            <button
              className={`track-card__tab ${mode === "id" ? "track-card__tab--active" : ""}`}
              onClick={() => { setMode("id"); setResults(null); setError(null); }}
            >
              By Registration ID
            </button>
            <button
              className={`track-card__tab ${mode === "email" ? "track-card__tab--active" : ""}`}
              onClick={() => { setMode("email"); setResults(null); setError(null); }}
            >
              By Email
            </button>
          </div>

          <form onSubmit={handleSearch} className="track-card__form">
            {mode === "id" ? (
              <div className="form-group">
                <label htmlFor="reg-id">Registration ID</label>
                <input
                  id="reg-id"
                  className="form-input"
                  placeholder="e.g. REG-2026-0001"
                  required
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  className="form-input"
                  type="email"
                  placeholder="your.email@example.com"
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
              {loading ? "Searching…" : "Track Registration"}
            </button>
          </form>

          {results && results.length > 0 && (
            <div className="reg-results" id="registration-results">
              {results.map((r, i) => (
                <div className="reg-entry" key={i}>
                  <div className="reg-entry__header">
                    <div>
                      <h3 className="reg-entry__conf-name">{r.conference?.name || "Conference"}</h3>
                      <span className="reg-entry__meta">
                        {r.conference?.venue && `${r.conference.venue}, `}
                        {r.conference?.city}
                        {r.conference?.startDate && ` · ${new Date(r.conference.startDate).toLocaleDateString()}`}
                      </span>
                    </div>
                    <span className={`badge ${STATUS_STYLE[r.registrationStatus] || "badge--primary"}`}>
                      {r.registrationStatus}
                    </span>
                  </div>
                  <div className="reg-entry__body">
                    <div className="reg-entry__grid">
                      <div>
                        <span className="reg-entry__label">Registration ID</span>
                        <span className="reg-entry__value">{r.registrationId}</span>
                      </div>
                      <div>
                        <span className="reg-entry__label">Registered On</span>
                        <span className="reg-entry__value">
                          {new Date(r.registeredAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="reg-entry__label">Participant</span>
                        <span className="reg-entry__value">{r.participant?.fullName}</span>
                      </div>
                      <div>
                        <span className="reg-entry__label">Type</span>
                        <span className="reg-entry__value">{r.participant?.participantType || '—'}</span>
                      </div>
                    </div>
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
