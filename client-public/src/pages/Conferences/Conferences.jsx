import { useState } from "react";
import { usePublicConferencesQuery, usePublicThemesQuery } from "../../hooks/usePublicQueries";
import ConferenceCard from "../../components/ConferenceCard";
import Pagination from "../../components/Pagination";
import { Inbox, Search } from "lucide-react";
import "./Conferences.css";

const PER_PAGE = 8;

export default function Conferences() {
  const conferencesQuery = usePublicConferencesQuery();
  const themesQuery = usePublicThemesQuery();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("ALL");

  const conferences = conferencesQuery.data || [];
  const allThemes = themesQuery.data || [];
  const error = conferencesQuery.error || themesQuery.error;
  const loading = conferencesQuery.isLoading || themesQuery.isLoading;

  if (loading) return <div className="loader-wrap"><div className="loader"></div></div>;
  if (error) return <div className="error-box">{error.message}</div>;

  // Build a map: conferenceId -> [theme labels]
  const confThemeMap = {};
  allThemes.forEach((t) => {
    const cid = t.conferenceId?._id || t.conferenceId;
    if (!confThemeMap[cid]) confThemeMap[cid] = [];
    confThemeMap[cid].push(t.label);
  });

  // Unique theme labels for filter dropdown
  const uniqueThemes = [...new Set(allThemes.map((t) => t.label))].sort();

  const filtered = conferences
    .filter((c) => {
      if (!search) return true;
      return c.name.toLowerCase().includes(search.toLowerCase());
    })
    .filter((c) => {
      if (themeFilter === "ALL") return true;
      const themes = confThemeMap[c._id] || [];
      return themes.includes(themeFilter);
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const displayed = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 when filters change
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleTheme = (val) => { setThemeFilter(val); setPage(1); };

  return (
    <div className="page-conferences section">
      <div className="container">
        <h1 className="section__title">All Conferences</h1>
        <p className="section__subtitle">
          Browse every international scientific conference organized by Blida 1 University.
        </p>

        <div className="filter-bar">
          <div className="filter-bar__search">
            <Search size={16} strokeWidth={2} className="filter-bar__search-icon" />
            <input
              type="text"
              className="form-input filter-bar__input"
              placeholder="Search conferences…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select filter-bar__select"
            value={themeFilter}
            onChange={(e) => handleTheme(e.target.value)}
          >
            <option value="ALL">All Themes</option>
            {uniqueThemes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

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
            <div className="empty-state__icon"><Inbox size={48} strokeWidth={1.5} /></div>
            <div className="empty-state__title">No conferences found</div>
          </div>
        )}
      </div>
    </div>
  );
}
