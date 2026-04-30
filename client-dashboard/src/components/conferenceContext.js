import { createContext, useContext } from 'react';

export const ConferenceContext = createContext();

export function useConference() {
  return useContext(ConferenceContext);
}
