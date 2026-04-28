import { useEffect, useState } from "react";
import { fetchConferences } from "../../api";
import ConferenceCard from "../../components/ConferenceCard";
import Pagination from "../../components/Pagination";
import "./Conferences.css";

const PER_PAGE = 8;

export default function Conferences() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchConferences()
      .then((res) => setConferences(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="loader"></div></div>;
  if (error) return <div className="error-box">{error}</div>;

  const totalPages = Math.ceil(conferences.length / PER_PAGE);
  const displayed = conferences.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page-conferences section">
      <div className="container">
        <h1 className="section__title">All Conferences</h1>
        <p className="section__subtitle">
          Browse every international scientific conference organized by Blida 1 University.
        </p>

        {displayed.length > 0 ? (
          <>
            <div className="grid-2">
              {displayed.map((c) => (
                <ConferenceCard key={c._id} conference={c} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__title">No conferences found</div>
          </div>
        )}
      </div>
    </div>
  );
}
