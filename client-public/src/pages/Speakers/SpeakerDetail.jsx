import { useParams, Link } from "react-router-dom";
import { usePublicSpeakerQuery } from "../../hooks/usePublicQueries";
import { Building2, MapPin, Mail } from "lucide-react";
import "./SpeakerDetail.css";

export default function SpeakerDetail() {
  const { id } = useParams();
  const { data: speaker, isLoading, error } = usePublicSpeakerQuery(id);

  if (isLoading) return <div className="loader-wrap"><div className="loader"></div></div>;
  if (error) return <div className="error-box">{error.message}</div>;
  if (!speaker) return <div className="error-box">Speaker not found.</div>;

  const initials = speaker.fullName
    ? speaker.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="speaker-detail section fade-in">
      <div className="container">
        <Link to="/speakers" className="speaker-detail__back" id="back-to-speakers">
          ← Back to Speakers
        </Link>

        <div className="speaker-detail__card" id="speaker-detail-card">
          <div className="speaker-detail__header">
            <div className="speaker-detail__avatar">
              {speaker.photoUrl ? (
                <img src={speaker.photoUrl} alt={speaker.fullName} />
              ) : (
                <span className="speaker-detail__initials">{initials}</span>
              )}
            </div>

            <div className="speaker-detail__info">
              <h1 className="speaker-detail__name">{speaker.fullName}</h1>

              {speaker.academicTitle && (
                <span className="speaker-detail__academic-title">{speaker.academicTitle}</span>
              )}

              <div className="speaker-detail__meta">
                {speaker.affiliation && (
                  <div className="speaker-detail__meta-item">
                    <span><Building2 size={16} strokeWidth={2} /></span>
                    <span>{speaker.affiliation}</span>
                  </div>
                )}
                {speaker.country && (
                  <div className="speaker-detail__meta-item">
                    <span><MapPin size={16} strokeWidth={2} /></span>
                    <span>{speaker.country}</span>
                  </div>
                )}
                {speaker.email && (
                  <div className="speaker-detail__meta-item">
                    <span><Mail size={16} strokeWidth={2} /></span>
                    <a href={`mailto:${speaker.email}`}>{speaker.email}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {speaker.topic && (
            <div className="speaker-detail__section">
              <h2 className="speaker-detail__section-title">Research Topic</h2>
              <p className="speaker-detail__topic">{speaker.topic}</p>
            </div>
          )}

          {speaker.biography && (
            <div className="speaker-detail__section">
              <h2 className="speaker-detail__section-title">Biography</h2>
              <p className="speaker-detail__bio">{speaker.biography}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
