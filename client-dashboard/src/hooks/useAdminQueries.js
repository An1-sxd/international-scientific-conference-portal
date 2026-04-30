import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConference,
  createSession,
  createSpeaker,
  createTheme,
  deleteConference,
  deleteParticipant,
  deleteSession,
  deleteSpeaker,
  deleteSubmission,
  deleteTheme,
  fetchCertificates,
  fetchConferences,
  fetchCurrentAdmin,
  fetchDashboardStats,
  fetchParticipants,
  fetchRegistrations,
  fetchResearches,
  fetchSessions,
  fetchSpeakers,
  fetchSubmissions,
  fetchThemes,
  generateCertificatePdf,
  generateCertificatesBatch,
  loginAdmin,
  logoutAdmin,
  updateConference,
  updateParticipant,
  updateRegistrationStatus,
  updateSession,
  updateSpeaker,
  updateSubmissionStatus,
  updateTheme,
  uploadCertificatePdf,
} from '../api';

export const adminQueryKeys = {
  currentAdmin: ['admin', 'currentAdmin'],
  conferences: ['admin', 'conferences'],
  dashboardStats: (conferenceId) => ['admin', 'dashboardStats', conferenceId],
  themes: (conferenceId) => ['admin', 'themes', conferenceId],
  speakers: (conferenceId) => ['admin', 'speakers', conferenceId],
  sessions: (conferenceId) => ['admin', 'sessions', conferenceId],
  submissions: (conferenceId) => ['admin', 'submissions', conferenceId],
  registrations: (conferenceId) => ['admin', 'registrations', conferenceId],
  participants: (conferenceId) => ['admin', 'participants', conferenceId],
  certificates: (conferenceId) => ['admin', 'certificates', conferenceId],
  researches: (conferenceId) => ['admin', 'researches', conferenceId],
};

const responseData = (response) => response.data;

function invalidateConferenceData(queryClient, conferenceId) {
  [
    adminQueryKeys.dashboardStats(conferenceId),
    adminQueryKeys.themes(conferenceId),
    adminQueryKeys.speakers(conferenceId),
    adminQueryKeys.sessions(conferenceId),
    adminQueryKeys.submissions(conferenceId),
    adminQueryKeys.registrations(conferenceId),
    adminQueryKeys.participants(conferenceId),
    adminQueryKeys.certificates(conferenceId),
    adminQueryKeys.researches(conferenceId),
  ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
}

export function useCurrentAdminQuery() {
  return useQuery({
    queryKey: adminQueryKeys.currentAdmin,
    queryFn: () => fetchCurrentAdmin().then((response) => response.data.admin),
  });
}

export function useLoginAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => loginAdmin(email, password),
    onSuccess: (response) => {
      queryClient.setQueryData(adminQueryKeys.currentAdmin, response.data.admin);
    },
  });
}

export function useLogoutAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAdmin,
    onSettled: () => {
      queryClient.setQueryData(adminQueryKeys.currentAdmin, null);
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' && query.queryKey[1] !== 'currentAdmin',
      });
    },
  });
}

export function useAdminConferencesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.conferences,
    queryFn: fetchConferences,
    select: responseData,
  });
}

export function useDashboardStatsQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.dashboardStats(conferenceId),
    queryFn: () => fetchDashboardStats(conferenceId),
    select: (response) => response.stats,
    enabled: Boolean(conferenceId),
  });
}

export function useCreateConferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConference,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.conferences }),
  });
}

export function useUpdateConferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateConference(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.conferences }),
  });
}

export function useDeleteConferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.conferences });
      queryClient.invalidateQueries({ queryKey: ['admin'], exact: false });
    },
  });
}

export function useAdminThemesQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.themes(conferenceId),
    queryFn: () => fetchThemes(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useCreateThemeMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => createTheme(conferenceId, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useUpdateThemeMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateTheme(id, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useDeleteThemeMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTheme,
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminSpeakersQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.speakers(conferenceId),
    queryFn: () => fetchSpeakers(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useCreateSpeakerMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createSpeaker(conferenceId, formData),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useUpdateSpeakerMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => updateSpeaker(id, formData),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useDeleteSpeakerMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpeaker,
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminSessionsQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.sessions(conferenceId),
    queryFn: () => fetchSessions(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useCreateSessionMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => createSession(conferenceId, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useUpdateSessionMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateSession(id, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useDeleteSessionMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminSubmissionsQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.submissions(conferenceId),
    queryFn: () => fetchSubmissions(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useUpdateSubmissionStatusMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateSubmissionStatus(id, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useDeleteSubmissionMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmission,
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminRegistrationsQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.registrations(conferenceId),
    queryFn: () => fetchRegistrations(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useUpdateRegistrationStatusMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateRegistrationStatus(id, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminParticipantsQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.participants(conferenceId),
    queryFn: () => fetchParticipants(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useUpdateParticipantMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateParticipant(id, body),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useDeleteParticipantMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteParticipant,
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminCertificatesQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.certificates(conferenceId),
    queryFn: () => fetchCertificates(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}

export function useGenerateCertificatesBatchMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateCertificatesBatch(conferenceId),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useUploadCertificatePdfMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => uploadCertificatePdf(id, formData),
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useGenerateCertificatePdfMutation(conferenceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateCertificatePdf,
    onSuccess: () => invalidateConferenceData(queryClient, conferenceId),
  });
}

export function useAdminResearchesQuery(conferenceId) {
  return useQuery({
    queryKey: adminQueryKeys.researches(conferenceId),
    queryFn: () => fetchResearches(conferenceId),
    select: responseData,
    enabled: Boolean(conferenceId),
  });
}
