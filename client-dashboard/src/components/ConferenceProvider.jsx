import { useState, useEffect, createContext, useContext } from 'react';
import { fetchConferences } from '../api';

const ConferenceContext = createContext();

export function useConference() {
  return useContext(ConferenceContext);
}

export function ConferenceProvider({ children }) {
  const [conferences, setConferences] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences()
      .then((res) => {
        setConferences(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refresh = () =>
    fetchConferences().then((res) => {
      setConferences(res.data);
      if (!res.data.find((c) => c._id === selectedId) && res.data.length > 0) {
        setSelectedId(res.data[0]._id);
      }
    });

  const selected = conferences.find((c) => c._id === selectedId) || null;

  return (
    <ConferenceContext.Provider
      value={{ conferences, selected, selectedId, setSelectedId, loading, refresh }}
    >
      {children}
    </ConferenceContext.Provider>
  );
}
