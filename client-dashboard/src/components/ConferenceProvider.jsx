import { useEffect, useMemo, useState } from 'react';
import { ConferenceContext } from './conferenceContext';
import { useAdminConferencesQuery } from '../hooks/useAdminQueries';

export function ConferenceProvider({ children }) {
  const [selectedId, setSelectedId] = useState('');
  const conferencesQuery = useAdminConferencesQuery();
  const conferences = useMemo(() => conferencesQuery.data || [], [conferencesQuery.data]);

  useEffect(() => {
    if (!selectedId && conferences.length > 0) {
      setSelectedId(conferences[0]._id);
    }
  }, [conferences, selectedId]);

  useEffect(() => {
    if (selectedId && conferences.length > 0 && !conferences.find((c) => c._id === selectedId)) {
      setSelectedId(conferences[0]._id);
    }
  }, [conferences, selectedId]);

  const refresh = () => conferencesQuery.refetch();

  const selected = conferences.find((c) => c._id === selectedId) || null;

  return (
    <ConferenceContext.Provider
      value={{ conferences, selected, selectedId, setSelectedId, loading: conferencesQuery.isLoading, refresh }}
    >
      {children}
    </ConferenceContext.Provider>
  );
}
