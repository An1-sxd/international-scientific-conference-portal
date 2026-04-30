import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchStats,
  fetchActiveConference,
  fetchSpeakers,
  fetchThemes,
  fetchConferences,
} from "../../api";
import ConferenceCard from "../../components/ConferenceCard";
import SpeakerCard from "../../components/SpeakerCard";
import { GraduationCap, Inbox, Mic2, Tag } from "lucide-react";
import "./Home.css";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [conferences, setConferences] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeConf, setActiveConf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, confRes, speakersRes, themesRes] = await Promise.allSettled([
          fetchStats(),
          fetchConferences(),
          fetchSpeakers(),
          fetchThemes(),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (confRes.status === "fulfilled") setConferences(confRes.value.data || []);
        if (speakersRes.status === "fulfilled") setSpeakers(speakersRes.value.data || []);
        if (themesRes.status === "fulfilled") setThemes(themesRes.value.data || []);

        // Try to get active conference for hero
        try {
          const activeRes = await fetchActiveConference();
          setActiveConf(activeRes.data);
        } catch {}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* ── Hero Section ── */}
      <section className="hero" id="hero-section">
        <div className="hero__bg-orbs">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__orb hero__orb--3"></div>
        </div>

        <div className="container hero__content fade-in">
          <span className="badge badge--primary hero__badge">
            <GraduationCap size={18} strokeWidth={2} /> Université Blida 1
          </span>
          <h1 className="hero__title">
            International Scientific<br />
            <span className="text-gradient">Conference Portal</span>
          </h1>
          <p className="hero__subtitle">
            Explore world-class conferences, connect with leading researchers,
            and contribute to advancing knowledge at Blida 1 University.
          </p>
          <div className="hero__actions">
            <Link to="/conferences" className="btn btn--primary btn--lg" id="hero-browse-btn">
              Browse Conferences
            </Link>
            <Link to="/submit-paper" className="btn btn--outline btn--lg" id="hero-submit-btn">
              Submit a Paper
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      {stats && (
        <section className="stats-bar fade-in" id="stats-section">
          <div className="container grid-4">
            <div className="stat-item">
              <span className="stat-item__number">{stats.totalConferences}</span>
              <span className="stat-item__label">Conferences</span>
            </div>
            <div className="stat-item">
              <span className="stat-item__number">{stats.totalSpeakers}</span>
              <span className="stat-item__label">Speakers</span>
            </div>
            <div className="stat-item">
              <span className="stat-item__number">{stats.totalThemes}</span>
              <span className="stat-item__label">Themes</span>
            </div>
            <div className="stat-item">
              <span className="stat-item__number">{stats.totalCountries}</span>
              <span className="stat-item__label">Countries</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Conferences ── */}
      <section className="section" id="conferences-section">
        <div className="container">
          <h2 className="section__title">Featured Conferences</h2>
          <p className="section__subtitle">
            Discover the latest international scientific conferences hosted by Blida 1 University.
          </p>

          {conferences.length > 0 ? (
            <>
              <div className="grid-2">
                {conferences.slice(0, 4).map((c) => (
                  <ConferenceCard key={c._id} conference={c} />
                ))}
              </div>
              {conferences.length > 4 && (
                <div className="text-center" style={{ marginTop: "var(--sp-2xl)" }}>
                  <Link to="/conferences" className="btn btn--outline" id="view-all-conferences">
                    View All Conferences →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon"><Inbox size={48} strokeWidth={1.5} /></div>
              <div className="empty-state__title">No conferences yet</div>
              <p>Stay tuned for upcoming events.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Speakers ── */}
      <section className="section section--alt" id="speakers-section">
        <div className="container">
          <h2 className="section__title">Distinguished Speakers</h2>
          <p className="section__subtitle">
            Meet the brilliant minds shaping the future of scientific research.
          </p>

          {speakers.length > 0 ? (
            <>
              <div className="grid-4">
                {speakers.slice(0, 4).map((s) => (
                  <SpeakerCard key={s._id} speaker={s} />
                ))}
              </div>
              {speakers.length > 4 && (
                <div className="text-center" style={{ marginTop: "var(--sp-2xl)" }}>
                  <Link to="/speakers" className="btn btn--outline" id="view-all-speakers">
                    View All Speakers →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon"><Mic2 size={48} strokeWidth={1.5} /></div>
              <div className="empty-state__title">No speakers yet</div>
              <p>Speakers will be announced soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Themes ── */}
      <section className="section" id="themes-section">
        <div className="container">
          <h2 className="section__title">Conference Themes</h2>
          <p className="section__subtitle">
            Explore the key research topics driving our academic discussions.
          </p>

          {themes.length > 0 ? (
            <div className="grid-4">
              {themes.slice(0, 4).map((t, i) => (
                <div key={t._id} className="card theme-card fade-in" style={{ animationDelay: `${i * 0.1}s` }} id={`theme-card-${t._id}`}>
                  <span className="theme-card__code badge badge--accent">{t.code}</span>
                  <h3 className="theme-card__label">{t.label}</h3>
                  {t.description && (
                    <p className="theme-card__desc">
                      {t.description.length > 120
                        ? t.description.slice(0, 120) + "…"
                        : t.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon"><Tag size={48} strokeWidth={1.5} /></div>
              <div className="empty-state__title">No themes yet</div>
              <p>Themes will be announced soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section cta-section" id="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-box__title">Ready to Contribute?</h2>
            <p className="cta-box__desc">
              Submit your research paper or register to attend the next conference at Blida 1 University.
            </p>
            <div className="cta-box__actions">
              <Link to="/submit-paper" className="btn btn--primary btn--lg" id="cta-submit-btn">
                Submit a Paper
              </Link>
              <Link to="/conferences" className="btn btn--outline btn--lg" id="cta-register-btn">
                Explore Conferences
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
