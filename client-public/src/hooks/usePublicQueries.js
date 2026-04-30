import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  checkCertificateStatus,
  checkSubmissionStatus,
  fetchActiveConference,
  fetchConferenceById,
  fetchConferences,
  fetchSpeakerById,
  fetchSpeakers,
  fetchStats,
  fetchThemes,
  registerForConference,
  submitPaper,
  trackRegistration,
} from "../api";

export const publicQueryKeys = {
  stats: ["public", "stats"],
  activeConference: ["public", "activeConference"],
  conferences: ["public", "conferences"],
  conference: (id) => ["public", "conference", id],
  speakers: (conferenceId) => ["public", "speakers", conferenceId || "all"],
  speaker: (id) => ["public", "speaker", id],
  themes: (conferenceId) => ["public", "themes", conferenceId || "all"],
};

const responseData = (response) => response.data;

export function useHomeDataQueries() {
  const [stats, conferences, speakers, themes, activeConference] = useQueries({
    queries: [
      { queryKey: publicQueryKeys.stats, queryFn: fetchStats, select: responseData },
      { queryKey: publicQueryKeys.conferences, queryFn: fetchConferences, select: responseData },
      { queryKey: publicQueryKeys.speakers(), queryFn: () => fetchSpeakers(), select: responseData },
      { queryKey: publicQueryKeys.themes(), queryFn: () => fetchThemes(), select: responseData },
      { queryKey: publicQueryKeys.activeConference, queryFn: fetchActiveConference, select: responseData },
    ],
  });

  return {
    stats: stats.data || null,
    conferences: conferences.data || [],
    speakers: speakers.data || [],
    themes: themes.data || [],
    activeConference: activeConference.data || null,
    isLoading: [stats, conferences, speakers, themes, activeConference].some((query) => query.isLoading),
  };
}

export function usePublicConferencesQuery() {
  return useQuery({
    queryKey: publicQueryKeys.conferences,
    queryFn: fetchConferences,
    select: responseData,
  });
}

export function usePublicConferenceQuery(id) {
  return useQuery({
    queryKey: publicQueryKeys.conference(id),
    queryFn: () => fetchConferenceById(id),
    select: responseData,
    enabled: Boolean(id),
  });
}

export function usePublicSpeakersQuery(conferenceId) {
  return useQuery({
    queryKey: publicQueryKeys.speakers(conferenceId),
    queryFn: () => fetchSpeakers(conferenceId),
    select: responseData,
  });
}

export function usePublicSpeakerQuery(id) {
  return useQuery({
    queryKey: publicQueryKeys.speaker(id),
    queryFn: () => fetchSpeakerById(id),
    select: responseData,
    enabled: Boolean(id),
  });
}

export function usePublicThemesQuery(conferenceId, options = {}) {
  return useQuery({
    queryKey: publicQueryKeys.themes(conferenceId),
    queryFn: () => fetchThemes(conferenceId),
    select: responseData,
    enabled: options.enabled ?? true,
  });
}

export function useRegisterForConferenceMutation() {
  return useMutation({
    mutationFn: registerForConference,
  });
}

export function useSubmitPaperMutation() {
  return useMutation({
    mutationFn: submitPaper,
  });
}

export function useTrackSubmissionMutation() {
  return useMutation({
    mutationFn: checkSubmissionStatus,
  });
}

export function useTrackRegistrationMutation() {
  return useMutation({
    mutationFn: trackRegistration,
  });
}

export function useCertificateStatusMutation() {
  return useMutation({
    mutationFn: checkCertificateStatus,
  });
}
