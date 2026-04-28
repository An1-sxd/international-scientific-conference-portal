import { useEffect, useState } from "react";
import { fetchSpeakers } from "../../api";
import SpeakerCard from "../../components/SpeakerCard";
import Pagination from "../../components/Pagination";
import "./Speakers.css";

const PER_PAGE = 8;

export default function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSpeakers()
      .then((res) => setSpeakers(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="loader"></div></div>;
  if (error) return <div className="error-box">{error}</div>;

  const totalPages = Math.ceil(speakers.length / PER_PAGE);
  const displayed = speakers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page-speakers section">
      <div className="container">
        <h1 className="section__title">All Speakers</h1>
        <p className="section__subtitle">
          Meet the distinguished researchers and professors presenting at our conferences.
        </p>

        {displayed.length > 0 ? (
          <>
            <div className="grid-4">
              {displayed.map((s) => (
                <SpeakerCard key={s._id} speaker={s} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">🎤</div>
            <div className="empty-state__title">No speakers found</div>
          </div>
        )}
      </div>
    </div>
  );
}
