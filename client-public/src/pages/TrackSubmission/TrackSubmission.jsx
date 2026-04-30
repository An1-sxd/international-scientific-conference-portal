import { useState } from "react";
import { useTrackSubmissionMutation } from "../../hooks/usePublicQueries";
import useFormValidation from "../../hooks/useFormValidation";
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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const trackSubmissionMutation = useTrackSubmissionMutation();
  const { touched, errors, touchField, validate, groupClass, resetValidation } = useFormValidation();

  const switchMode = (m) => { setMode(m); resetValidation(); };

  const handleSearch = async (e) => {
    e.preventDefault();
    const rules = mode === "id"
      ? { submissionId: { required: true } }
      : { email: { required: true, email: true }, paperTitle: { required: true } };
    const vals = mode === "id" ? { submissionId } : { email, paperTitle };
    if (!validate(vals, rules)) return;

    setError(null);
    setResult(null);
    try {
      const params =
        mode === "id"
          ? { submissionId }
          : { email, paperTitle };
      const res = await trackSubmissionMutation.mutateAsync(params);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
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
              onClick={() => switchMode("id")}
            >
              By Submission ID
            </button>
            <button
              className={`track-card__tab ${mode === "email" ? "track-card__tab--active" : ""}`}
              onClick={() => switchMode("email")}
            >
              By Email &amp; Title
            </button>
          </div>

          <form onSubmit={handleSearch} className="track-card__form" noValidate>
            {mode === "id" ? (
              <div className={groupClass('submissionId')}>
                <label htmlFor="track-id">Submission ID</label>
                <input
                  id="track-id"
                  className="form-input"
                  placeholder="e.g. SUB-2026-0001"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                  onBlur={() => touchField('submissionId', submissionId, { required: true })}
                />
                {touched.submissionId && errors.submissionId && <span className="form-error">{errors.submissionId}</span>}
              </div>
            ) : (
              <>
                <div className={groupClass('email')}>
                  <label htmlFor="track-email">Author Email</label>
                  <input
                    id="track-email"
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touchField('email', email, { required: true, email: true })}
                  />
                  {touched.email && errors.email && <span className="form-error">{errors.email}</span>}
                </div>
                <div className={groupClass('paperTitle')}>
                  <label htmlFor="track-title">Paper Title</label>
                  <input
                    id="track-title"
                    className="form-input"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    onBlur={() => touchField('paperTitle', paperTitle, { required: true })}
                  />
                  {touched.paperTitle && errors.paperTitle && <span className="form-error">{errors.paperTitle}</span>}
                </div>
              </>
            )}

            {error && <div className="track-card__error">{error}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={trackSubmissionMutation.isPending}
              style={{ width: "100%" }}
            >
              {trackSubmissionMutation.isPending ? "Searching…" : "Track Submission"}
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
