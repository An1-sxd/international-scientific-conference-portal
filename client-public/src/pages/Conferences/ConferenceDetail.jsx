import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchConferenceById, registerForConference } from "../../api";
import SpeakerCard from "../../components/SpeakerCard";
import "./ConferenceDetail.css";

function fmt(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}
function fmtTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ConferenceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    fullName: "", email: "", phone: "", affiliation: "", country: "", participantType: "RESEARCHER",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState(null);

  useEffect(() => {
    fetchConferenceById(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      const res = await registerForConference({
        ...regForm,
        conferenceId: id,
      });
      setRegResult(res.data);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) return <div className="loader-wrap"><div className="loader"></div></div>;
  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <div className="error-box">Conference not found.</div>;

  const { conference: conf, speakers, themes, sessions } = data;

  return (
    <>
      <div className="conf-detail fade-in">
        {/* ── Hero Banner ── */}
        <section className="conf-detail__hero" id="conf-detail-hero">
          <div className="conf-detail__hero-bg">
            <div className="hero__orb hero__orb--1"></div>
            <div className="hero__orb hero__orb--2"></div>
          </div>
          <div className="container conf-detail__hero-content">
            <div className="conf-detail__badges">
              <span className="badge badge--primary">{conf.country || "International"}</span>
              {conf.isActive && <span className="badge badge--success">Active</span>}
            </div>
            <h1 className="conf-detail__title">{conf.name}</h1>
            {conf.slogan && <p className="conf-detail__slogan">{conf.slogan}</p>}

            <div className="conf-detail__meta-row">
              <div className="conf-detail__meta-item">
                <span>📅</span>
                <span>{fmt(conf.startDate)} — {fmt(conf.endDate)}</span>
              </div>
              {conf.venue && (
                <div className="conf-detail__meta-item">
                  <span>📍</span>
                  <span>{conf.venue}{conf.city ? `, ${conf.city}` : ""}</span>
                </div>
              )}
              {conf.contactEmail && (
                <div className="conf-detail__meta-item">
                  <span>✉️</span>
                  <a href={`mailto:${conf.contactEmail}`}>{conf.contactEmail}</a>
                </div>
              )}
            </div>

            <button
              className="btn btn--primary btn--lg"
              id="register-conference-btn"
              onClick={() => setShowRegModal(true)}
            >
              Register for this Conference
            </button>
          </div>
        </section>

        <div className="container">
          {/* ── Description ── */}
          {conf.description && (
            <section className="conf-detail__section" id="conf-description">
              <h2 className="conf-detail__section-title">About this Conference</h2>
              <p className="conf-detail__description">{conf.description}</p>
            </section>
          )}

          {/* ── Themes ── */}
          {themes.length > 0 && (
            <section className="conf-detail__section" id="conf-themes">
              <h2 className="conf-detail__section-title">Themes</h2>
              <div className="grid-3">
                {themes.map((t) => (
                  <div key={t._id} className="card theme-card">
                    <span className="theme-card__code badge badge--accent">{t.code}</span>
                    <h3 className="theme-card__label">{t.label}</h3>
                    {t.description && <p className="theme-card__desc">{t.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Speakers ── */}
          {speakers.length > 0 && (
            <section className="conf-detail__section" id="conf-speakers">
              <h2 className="conf-detail__section-title">Speakers</h2>
              <div className="grid-4">
                {speakers.map((s) => (
                  <SpeakerCard key={s._id} speaker={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── Agenda / Sessions ── */}
          {sessions.length > 0 && (
            <section className="conf-detail__section" id="conf-agenda">
              <h2 className="conf-detail__section-title">Agenda</h2>
              <div className="agenda-list">
                {sessions.map((s) => (
                  <div key={s._id} className="card agenda-item" id={`session-${s._id}`}>
                    <div className="agenda-item__time">
                      <span className="agenda-item__time-start">{fmtTime(s.startsAt)}</span>
                      <span className="agenda-item__time-sep">—</span>
                      <span className="agenda-item__time-end">{fmtTime(s.endsAt)}</span>
                      <span className="agenda-item__date">{fmt(s.startsAt)}</span>
                    </div>
                    <div className="agenda-item__body">
                      <h3 className="agenda-item__title">{s.sessionTitle}</h3>
                      <div className="agenda-item__tags">
                        {s.themeId && (
                          <span className="badge badge--accent">{s.themeId.code || s.themeId.label}</span>
                        )}
                        {s.room && <span className="badge badge--primary">🚪 {s.room}</span>}
                      </div>
                      {s.speakerId && (
                        <Link to={`/speakers/${s.speakerId._id}`} className="agenda-item__speaker">
                          <span className="agenda-item__speaker-avatar">
                            {s.speakerId.photoUrl
                              ? <img src={s.speakerId.photoUrl} alt={s.speakerId.fullName} />
                              : <span>{s.speakerId.fullName?.[0]}</span>
                            }
                          </span>
                          <div>
                            <span className="agenda-item__speaker-name">{s.speakerId.fullName}</span>
                            {s.speakerId.affiliation && (
                              <span className="agenda-item__speaker-aff">{s.speakerId.affiliation}</span>
                            )}
                          </div>
                        </Link>
                      )}
                      {s.description && <p className="agenda-item__desc">{s.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Registration Modal (outside fade-in div so position:fixed works) ── */}
      {showRegModal && (
        <div className="modal-overlay" onClick={() => setShowRegModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} id="registration-modal">
            <button className="modal__close" onClick={() => setShowRegModal(false)}>✕</button>

            {regResult ? (
              <div className="modal__success">
                <div className="modal__success-icon">✅</div>
                <h2>Registration Successful!</h2>
                <p>Your registration ID is:</p>
                <span className="modal__reg-id">{regResult.registrationId}</span>
                <p className="modal__reg-conf">
                  Registered for <strong>{regResult.conference?.name}</strong>
                </p>
                <button className="btn btn--primary" onClick={() => setShowRegModal(false)}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="modal__title">Register for Conference</h2>
                <p className="modal__subtitle">{conf.name}</p>

                {regError && <div className="modal__error">{regError}</div>}

                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label htmlFor="reg-fullName">Full Name *</label>
                    <input id="reg-fullName" className="form-input" required
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-email">Email *</label>
                    <input id="reg-email" className="form-input" type="email" required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label htmlFor="reg-phone">Phone</label>
                      <input id="reg-phone" className="form-input"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-country">Country</label>
                      <input id="reg-country" className="form-input"
                        value={regForm.country}
                        onChange={(e) => setRegForm({ ...regForm, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-affiliation">Affiliation / Institution</label>
                    <input id="reg-affiliation" className="form-input"
                      value={regForm.affiliation}
                      onChange={(e) => setRegForm({ ...regForm, affiliation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-type">Participant Type</label>
                    <select id="reg-type" className="form-select"
                      value={regForm.participantType}
                      onChange={(e) => setRegForm({ ...regForm, participantType: e.target.value })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="RESEARCHER">Researcher</option>
                      <option value="PROFESSOR">Professor</option>
                      <option value="GUEST">Guest</option>
                      <option value="INDUSTRY">Industry</option>
                    </select>
                  </div>
                  <button className="btn btn--primary btn--lg" style={{ width: "100%" }} disabled={regLoading} type="submit">
                    {regLoading ? "Registering…" : "Register"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
