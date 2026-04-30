import { useConference } from './conferenceContext';

export default function ConferenceSelector() {
  const { conferences, selectedId, setSelectedId, loading } = useConference();

  if (loading) return <span className="badge badge--neutral">Loading…</span>;
  if (conferences.length === 0) return <span className="badge badge--warning">No conferences</span>;

  return (
    <select
      className="conf-select"
      value={selectedId}
      onChange={(e) => setSelectedId(e.target.value)}
    >
      {conferences.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
