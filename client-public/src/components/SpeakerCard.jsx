import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function SpeakerCard({ speaker }) {
  const initials = speaker.fullName
    ? speaker.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <Link to={`/speakers/${speaker._id || speaker.id}`} className="card speaker-card" id={`speaker-card-${speaker._id || speaker.id}`}>
      <div className="speaker-card__avatar">
        {speaker.photoUrl ? (
          <img src={speaker.photoUrl} alt={speaker.fullName} className="speaker-card__img" />
        ) : (
          <span className="speaker-card__initials">{initials}</span>
        )}
      </div>
      <h3 className="speaker-card__name">{speaker.fullName}</h3>
      {speaker.academicTitle && (
        <span className="speaker-card__title">{speaker.academicTitle}</span>
      )}
      {speaker.affiliation && (
        <p className="speaker-card__affiliation">{speaker.affiliation}</p>
      )}
      {speaker.country && (
        <span className="badge badge--accent speaker-card__country">
          <MapPin size={12} strokeWidth={2} /> {speaker.country}
        </span>
      )}
      {speaker.topic && (
        <p className="speaker-card__topic">{speaker.topic}</p>
      )}
    </Link>
  );
}
