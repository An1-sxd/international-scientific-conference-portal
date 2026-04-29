import { useEffect, useState } from "react";
import { fetchConferences, fetchThemes, submitPaper } from "../../api";
import "./SubmitPaper.css";

export default function SubmitPaper() {
  const [conferences, setConferences] = useState([]);
  const [selectedConf, setSelectedConf] = useState("");
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    themeId: "",
    paperTitle: "",
    abstract: "",
    institution: "",
    country: "",
  });
  const [authors, setAuthors] = useState([
    { fullName: "", email: "", affiliation: "", country: "", isCorresponding: true },
  ]);
  const [pdfFile, setPdfFile] = useState(null);

  // Load conferences on mount
  useEffect(() => {
    fetchConferences()
      .then((res) => {
        setConferences(res.data || []);
        // Auto-select first conference if available
        if (res.data?.length > 0) {
          setSelectedConf(res.data[0]._id || res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load themes when conference changes
  useEffect(() => {
    if (!selectedConf) { setThemes([]); return; }
    fetchThemes(selectedConf)
      .then((res) => setThemes(res.data || []))
      .catch(() => setThemes([]));
    // Reset theme selection when conference changes
    setForm((prev) => ({ ...prev, themeId: "" }));
  }, [selectedConf]);

  const addAuthor = () => {
    setAuthors([
      ...authors,
      { fullName: "", email: "", affiliation: "", country: "", isCorresponding: false },
    ]);
  };

  const removeAuthor = (idx) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== idx));
  };

  const updateAuthor = (idx, field, value) => {
    const next = [...authors];
    if (field === "isCorresponding" && value === true) {
      next.forEach((a) => (a.isCorresponding = false));
    }
    next[idx] = { ...next[idx], [field]: value };
    setAuthors(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("conferenceId", selectedConf);
      fd.append("themeId", form.themeId);
      fd.append("paperTitle", form.paperTitle);
      fd.append("abstract", form.abstract);
      fd.append("institution", form.institution);
      fd.append("country", form.country);
      fd.append(
        "authors",
        JSON.stringify(authors.map((a, i) => ({ ...a, authorOrder: i + 1 })))
      );
      if (pdfFile) fd.append("pdf", pdfFile);

      const res = await submitPaper(fd);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="section fade-in">
        <div className="container">
          <div className="submit-success" id="submission-success">
            <div className="submit-success__icon">🎉</div>
            <h1 className="submit-success__title">Paper Submitted Successfully!</h1>
            <p className="submit-success__msg">Your submission ID is:</p>
            <span className="submit-success__id">{result.submissionId}</span>
            <p className="submit-success__note">
              <strong>Paper:</strong> {result.paperTitle}<br />
              <strong>Status:</strong>{" "}
              <span className="badge badge--warning">{result.status}</span>
            </p>
            <p className="submit-success__tip">
              Save your submission ID to track the review status later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section fade-in">
      <div className="container">
        <h1 className="section__title">Submit a Paper</h1>
        <p className="section__subtitle">
          Submit your research paper for review. Select the conference, fill in all required fields and attach your PDF.
        </p>

        <form className="submit-form" onSubmit={handleSubmit} id="submit-paper-form">
          {error && <div className="submit-form__error">{error}</div>}

          <div className="submit-form__card">
            <h2 className="submit-form__card-title">Paper Information</h2>

            {/* ── Conference Selector ── */}
            <div className="form-group">
              <label htmlFor="sp-conference">Conference *</label>
              <select
                id="sp-conference"
                className="form-select"
                required
                value={selectedConf}
                onChange={(e) => setSelectedConf(e.target.value)}
              >
                <option value="">Select a conference…</option>
                {conferences.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sp-theme">Theme *</label>
              <select
                id="sp-theme"
                className="form-select"
                required
                value={form.themeId}
                onChange={(e) => setForm({ ...form, themeId: e.target.value })}
                disabled={!selectedConf}
              >
                <option value="">{selectedConf ? "Select a theme…" : "Select a conference first"}</option>
                {themes.map((t) => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.code} — {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sp-title">Paper Title *</label>
              <input
                id="sp-title"
                className="form-input"
                required
                maxLength={300}
                value={form.paperTitle}
                onChange={(e) => setForm({ ...form, paperTitle: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sp-abstract">Abstract *</label>
              <textarea
                id="sp-abstract"
                className="form-textarea"
                required
                maxLength={10000}
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="sp-institution">Institution</label>
                <input
                  id="sp-institution"
                  className="form-input"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sp-country">Country</label>
                <input
                  id="sp-country"
                  className="form-input"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sp-pdf">PDF File</label>
              <input
                id="sp-pdf"
                type="file"
                accept=".pdf"
                className="form-input"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* ── Authors ── */}
          <div className="submit-form__card">
            <div className="submit-form__card-header">
              <h2 className="submit-form__card-title">Authors</h2>
              <button type="button" className="btn btn--outline btn--sm" onClick={addAuthor}>
                + Add Author
              </button>
            </div>

            {authors.map((a, idx) => (
              <div key={idx} className="author-block" id={`author-block-${idx}`}>
                <div className="author-block__header">
                  <span className="author-block__number">Author #{idx + 1}</span>
                  <label className="author-block__corresponding">
                    <input
                      type="radio"
                      name="corresponding"
                      checked={a.isCorresponding}
                      onChange={() => updateAuthor(idx, "isCorresponding", true)}
                    />
                    Corresponding
                  </label>
                  {authors.length > 1 && (
                    <button
                      type="button"
                      className="author-block__remove"
                      onClick={() => removeAuthor(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      className="form-input"
                      required
                      value={a.fullName}
                      onChange={(e) => updateAuthor(idx, "fullName", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      className="form-input"
                      type="email"
                      required
                      value={a.email}
                      onChange={(e) => updateAuthor(idx, "email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Affiliation</label>
                    <input
                      className="form-input"
                      value={a.affiliation}
                      onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      className="form-input"
                      value={a.country}
                      onChange={(e) => updateAuthor(idx, "country", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg"
            disabled={loading || !selectedConf}
            id="submit-paper-btn"
            style={{ width: "100%" }}
          >
            {loading ? "Submitting…" : "Submit Paper"}
          </button>
        </form>
      </div>
    </div>
  );
}
