import { useEffect, useState } from "react";
import { fetchSpeakers } from "../../api";
import SpeakerCard from "../../components/SpeakerCard";
import Pagination from "../../components/Pagination";
import { Mic2, Search } from "lucide-react";
import "./Speakers.css";

const PER_PAGE = 8;

export default function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");

  useEffect(() => {
    fetchSpeakers()
      .then((res) => setSpeakers(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="loader"></div></div>;
  if (error) return <div className="error-box">{error}</div>;

  // Extract unique topics and countries for filter dropdowns
  const uniqueTopics = [...new Set(speakers.map((s) => s.topic).filter(Boolean))].sort();
  const uniqueCountries = [...new Set(speakers.map((s) => s.country).filter(Boolean))].sort();

  const filtered = speakers
    .filter((s) => {
      if (!search) return true;
      return s.fullName.toLowerCase().includes(search.toLowerCase());
    })
    .filter((s) => {
      if (topicFilter === "ALL") return true;
      return s.topic === topicFilter;
    })
    .filter((s) => {
      if (countryFilter === "ALL") return true;
      return s.country === countryFilter;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const displayed = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 when filters change
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleTopic = (val) => { setTopicFilter(val); setPage(1); };
  const handleCountry = (val) => { setCountryFilter(val); setPage(1); };

  return (
    <div className="page-speakers section">
      <div className="container">
        <h1 className="section__title">All Speakers</h1>
        <p className="section__subtitle">
          Meet the distinguished researchers and professors presenting at our conferences.
        </p>

        <div className="filter-bar">
          <div className="filter-bar__search">
            <Search size={16} strokeWidth={2} className="filter-bar__search-icon" />
            <input
              type="text"
              className="form-input filter-bar__input"
              placeholder="Search speakers…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select filter-bar__select"
            value={topicFilter}
            onChange={(e) => handleTopic(e.target.value)}
          >
            <option value="ALL">All Topics</option>
            {uniqueTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="form-select filter-bar__select"
            value={countryFilter}
            onChange={(e) => handleCountry(e.target.value)}
          >
            <option value="ALL">All Countries</option>
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

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
            <div className="empty-state__icon"><Mic2 size={48} strokeWidth={1.5} /></div>
            <div className="empty-state__title">No speakers found</div>
          </div>
        )}
      </div>
    </div>
  );
}
