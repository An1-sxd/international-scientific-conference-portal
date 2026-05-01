const API_BASE = process.env.API_BASE || "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

// ─── Landing / Home ───
export const fetchStats = () => request("/stats");
export const fetchActiveConference = () => request("/conference/active");
export const fetchSpeakers = (conferenceId) =>
  request(`/speakers${conferenceId ? `?conferenceId=${conferenceId}` : ""}`);
export const fetchThemes = (conferenceId) =>
  request(`/themes${conferenceId ? `?conferenceId=${conferenceId}` : ""}`);

// ─── Conferences ───
export const fetchConferences = () => request("/conferences");
export const fetchConferenceById = (id) => request(`/conferences/${id}`);

// ─── Speakers ───
export const fetchSpeakerById = (id) => request(`/speakers/${id}`);

// ─── Agenda ───
export const fetchAgenda = (conferenceId) =>
  request(`/agenda${conferenceId ? `?conferenceId=${conferenceId}` : ""}`);

// ─── Registration ───
export const registerForConference = (body) =>
  request("/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

// ─── Submission ───
export const submitPaper = (formData) =>
  fetch(`${API_BASE}/submit-paper`, { method: "POST", body: formData }).then(
    async (r) => {
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      return d;
    }
  );

export const checkSubmissionStatus = (params) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/submissions/status?${qs}`);
};

// ─── Certificate ───
export const checkCertificate = (params) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/certificates/check?${qs}`);
};

export const fetchMyCertificates = (email) => {
  const qs = new URLSearchParams({ email }).toString();
  return request(`/certificates/my?${qs}`);
};

export const checkCertificateStatus = (params) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/certificates/my?${qs}`);
};

// ─── Registration Tracking ───
export const trackRegistration = (params) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/registrations/track?${qs}`);
};
