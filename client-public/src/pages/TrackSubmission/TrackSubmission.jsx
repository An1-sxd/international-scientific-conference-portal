import { useState } from "react";
import { checkSubmissionStatus } from "../../api";
import "./TrackSubmission.css";

const STATUS_STYLE = {
  PENDING: "badge--warning",
  UNDER_REVIEW: "badge--primary",
  ACCEPTED: "badge--success",
  REJECTED: "badge--danger",
  PUBLISHED: "badge--accent",
};

export default function TrackSubmission() {
  const [mode, setMode] = useState("id"); // "id" or "email"
  const [submissionId, setSubmissionId] = useState("");
  const [email, setEmail] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
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
        mode === "id"
          ? { submissionId }
          : { email, paperTitle };
      const res = await checkSubmissionStatus(params);
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
        <h1 className="section__title">Track Your Submission</h1>
        <p className="section__subtitle">
          Enter your submission ID or search by email and paper title to check the review status.
        </p>

        <div className="track-card" id="track-submission-form">
          <div className="track-card__tabs">
            <button
              className={`track-card__tab ${mode === "id" ? "track-card__tab--active" : ""}`}
              onClick={() => setMode("id")}
            >
              By Submission ID
            </button>
            <button
              className={`track-card__tab ${mode === "email" ? "track-card__tab--active" : ""}`}
              onClick={() => setMode("email")}
            >
              By Email & Title
            </button>
          </div>

          <form onSubmit={handleSearch} className="track-card__form">
            {mode === "id" ? (
              <div className="form-group">
                <label htmlFor="track-id">Submission ID</label>
                <input
                  id="track-id"
                  className="form-input"
                  placeholder="e.g. SUB-2026-0001"
                  required
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="track-email">Author Email</label>
                  <input
                    id="track-email"
                    className="form-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="track-title">Paper Title</label>
                  <input
                    id="track-title"
                    className="form-input"
                    required
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                  />
                </div>
              </>
            )}

            {error && <div className="track-card__error">{error}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Searching…" : "Track Submission"}
            </button>
          </form>

          {result && (
            <div className="track-result" id="track-result">
              <h3 className="track-result__title">{result.paperTitle}</h3>
              <div className="track-result__row">
                <span className="track-result__label">Submission ID</span>
                <span className="track-result__value">{result.submissionId}</span>
              </div>
              <div className="track-result__row">
                <span className="track-result__label">Status</span>
                <span className={`badge ${STATUS_STYLE[result.status] || "badge--primary"}`}>
                  {result.status}
                </span>
              </div>
              <div className="track-result__row">
                <span className="track-result__label">Submitted</span>
                <span className="track-result__value">
                  {new Date(result.submittedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
              {result.theme && (
                <div className="track-result__row">
                  <span className="track-result__label">Theme</span>
                  <span className="track-result__value">
                    {result.theme.code} — {result.theme.label}
                  </span>
                </div>
              )}
              {result.reviewComment && (
                <div className="track-result__comment">
                  <span className="track-result__label">Review Comment</span>
                  <p>{result.reviewComment}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
