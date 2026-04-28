import { Link } from "react-router-dom";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConferenceCard({ conference }) {
  const c = conference;
  return (
    <Link
      to={`/conferences/${c._id || c.id}`}
      className="card conf-card"
      id={`conf-card-${c._id || c.id}`}
    >
      <div className="conf-card__header">
        <span className="badge badge--primary">{c.country || "International"}</span>
        {c.isActive && <span className="badge badge--success">Active</span>}
      </div>

      <h3 className="conf-card__name">{c.name}</h3>

      {c.slogan && <p className="conf-card__slogan">{c.slogan}</p>}

      <div className="conf-card__meta">
        <div className="conf-card__meta-item">
          <span className="conf-card__icon">📅</span>
          <span>{formatDate(c.startDate)} — {formatDate(c.endDate)}</span>
        </div>
        {c.venue && (
          <div className="conf-card__meta-item">
            <span className="conf-card__icon">📍</span>
            <span>{c.venue}{c.city ? `, ${c.city}` : ""}</span>
          </div>
        )}
      </div>

      {c.description && (
        <p className="conf-card__desc">
          {c.description.length > 150
            ? c.description.slice(0, 150) + "…"
            : c.description}
        </p>
      )}
    </Link>
  );
}
