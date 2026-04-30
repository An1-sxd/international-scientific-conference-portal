const API_BASE = "http://localhost:3000/api/admin";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = { ...options, credentials: "include" };

  // Don't set Content-Type for FormData (browser handles multipart boundary)
  if (!(options.body instanceof FormData)) {
    config.headers = { "Content-Type": "application/json", ...options.headers };
  }

  const res = await fetch(url, config);
  const data = await res.json();

  // If 401, redirect to login (unless already on an auth endpoint)
  if (res.status === 401 && !endpoint.startsWith("/auth/")) {
    window.location.href = "/login";
    throw new Error("Session expired. Redirecting to login...");
  }

  if (!data.success) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

// ─── Auth ───
export const loginAdmin = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const logoutAdmin = () =>
  request("/auth/logout", { method: "POST" });
export const fetchCurrentAdmin = () =>
  request("/auth/me");

// ─── Dashboard ───
export const fetchDashboardStats = (conferenceId) =>
  request(`/dashboard/stats?conferenceId=${conferenceId}`);

// ─── Conferences ───
export const fetchConferences = () => request("/conferences");
export const fetchConferenceById = (id) => request(`/conferences/${id}`);
export const createConference = (body) =>
  request("/conferences", { method: "POST", body: JSON.stringify(body) });
export const updateConference = (id, body) =>
  request(`/conferences/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteConference = (id) =>
  request(`/conferences/${id}`, { method: "DELETE" });

// ─── Themes ───
export const fetchThemes = (conferenceId) =>
  request(`/themes?conferenceId=${conferenceId}`);
export const createTheme = (conferenceId, body) =>
  request(`/themes?conferenceId=${conferenceId}`, { method: "POST", body: JSON.stringify(body) });
export const updateTheme = (id, body) =>
  request(`/themes/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteTheme = (id) =>
  request(`/themes/${id}`, { method: "DELETE" });

// ─── Speakers ───
export const fetchSpeakers = (conferenceId) =>
  request(`/speakers?conferenceId=${conferenceId}`);
export const createSpeaker = (conferenceId, formData) =>
  request(`/speakers?conferenceId=${conferenceId}`, { method: "POST", body: formData });
export const updateSpeaker = (id, formData) =>
  request(`/speakers/${id}`, { method: "PUT", body: formData });
export const deleteSpeaker = (id) =>
  request(`/speakers/${id}`, { method: "DELETE" });

// ─── Sessions ───
export const fetchSessions = (conferenceId) =>
  request(`/sessions?conferenceId=${conferenceId}`);
export const createSession = (conferenceId, body) =>
  request(`/sessions?conferenceId=${conferenceId}`, { method: "POST", body: JSON.stringify(body) });
export const updateSession = (id, body) =>
  request(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteSession = (id) =>
  request(`/sessions/${id}`, { method: "DELETE" });

// ─── Submissions ───
export const fetchSubmissions = (conferenceId) =>
  request(`/submissions?conferenceId=${conferenceId}`);
export const updateSubmissionStatus = (id, body) =>
  request(`/submissions/${id}/status`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteSubmission = (id) =>
  request(`/submissions/${id}`, { method: "DELETE" });

// ─── Registrations ───
export const fetchRegistrations = (conferenceId) =>
  request(`/registrations?conferenceId=${conferenceId}`);
export const updateRegistrationStatus = (id, body) =>
  request(`/registrations/${id}/status`, { method: "PATCH", body: JSON.stringify(body) });

// ─── Participants ───
export const fetchParticipants = (conferenceId) =>
  request(`/participants?conferenceId=${conferenceId}`);
export const updateParticipant = (id, body) =>
  request(`/participants/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteParticipant = (id) =>
  request(`/participants/${id}`, { method: "DELETE" });

// ─── Certificates ───
export const fetchCertificates = (conferenceId) =>
  request(`/certificates?conferenceId=${conferenceId}`);
export const generateCertificate = (registrationIdRef) =>
  request("/certificates/generate", { method: "POST", body: JSON.stringify({ registrationIdRef }) });
export const generateCertificatesBatch = (conferenceId) =>
  request(`/certificates/generate-batch?conferenceId=${conferenceId}`, { method: "POST" });
export const uploadCertificatePdf = (id, formData) =>
  request(`/certificates/${id}/upload-pdf`, { method: "PATCH", body: formData });
export const generateCertificatePdf = (id) =>
  request(`/certificates/${id}/generate-pdf`, { method: "POST" });

// ─── Researches ───
export const fetchResearches = (conferenceId) =>
  request(`/researches?conferenceId=${conferenceId}`);
