import mongoose from "mongoose";

import Conference from "../../models/conference.model.js";

const ACTIVE_CERTIFICATE_STATUSES = new Set(["GENERATED", "ISSUED", "DOWNLOADED"]);

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const sendError = (res, status, message, details) => {
  const payload = { success: false, message };

  if (details) {
    payload.details = details;
  }

  return res.status(status).json(payload);
};

export const handleModelError = (res, error) => {
  if (error?.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => item.message);
    return sendError(res, 400, "Validation failed.", details);
  }

  if (error?.code === 11000) {
    const duplicateFields = Object.keys(error.keyPattern || {});
    return sendError(res, 409, "Duplicate value violates a unique constraint.", duplicateFields);
  }

  console.error(error);
  return sendError(res, 500, "Internal server error.");
};

const getRequestedConferenceId = (req) => req.query.conferenceId || req.body.conferenceId || null;

export const getActiveConference = () =>
  Conference.findOne({ isActive: true }).sort({ startDate: 1, createdAt: -1 });

export const resolveConference = async (req) => {
  const requestedConferenceId = getRequestedConferenceId(req);

  if (requestedConferenceId) {
    if (!isValidObjectId(requestedConferenceId)) {
      return {
        conference: null,
        status: 400,
        message: "Invalid conferenceId.",
      };
    }

    const conference = await Conference.findById(requestedConferenceId);
    if (!conference) {
      return {
        conference: null,
        status: 404,
        message: "Conference not found.",
      };
    }

    return { conference };
  }

  const conference = await getActiveConference();
  if (!conference) {
    return {
      conference: null,
      status: 404,
      message: "Active conference not found.",
    };
  }

  return { conference };
};

export const normalizeAuthors = (authors) =>
  authors.map((author, index) => ({
    fullName: typeof author?.fullName === "string" ? author.fullName.trim() : "",
    email: normalizeEmail(author?.email),
    affiliation: typeof author?.affiliation === "string" ? author.affiliation.trim() : "",
    country: typeof author?.country === "string" ? author.country.trim() : "",
    authorOrder:
      Number.isInteger(author?.authorOrder) && author.authorOrder > 0
        ? author.authorOrder
        : index + 1,
    isCorresponding: Boolean(author?.isCorresponding),
  }));

export const validateAuthors = (authors) => {
  if (!Array.isArray(authors) || authors.length === 0) {
    return "At least one author is required.";
  }

  const normalizedAuthors = normalizeAuthors(authors);

  const hasInvalidAuthor = normalizedAuthors.some((author) => !author.fullName || !author.email);
  if (hasInvalidAuthor) {
    return "Each author must include a fullName and email.";
  }

  const correspondingCount = normalizedAuthors.filter((author) => author.isCorresponding).length;
  if (correspondingCount !== 1) {
    return "Exactly one corresponding author is required.";
  }

  const authorOrders = normalizedAuthors.map((author) => author.authorOrder);
  if (new Set(authorOrders).size !== authorOrders.length) {
    return "Each author must have a unique authorOrder value.";
  }

  return null;
};

export const pickTheme = (theme) => {
  if (!theme) {
    return null;
  }

  return {
    id: theme._id,
    code: theme.code,
    label: theme.label,
    description: theme.description,
    displayOrder: theme.displayOrder,
  };
};

export const pickSpeaker = (speaker) => {
  if (!speaker) {
    return null;
  }

  return {
    id: speaker._id,
    fullName: speaker.fullName,
    academicTitle: speaker.academicTitle,
    affiliation: speaker.affiliation,
    country: speaker.country,
    topic: speaker.topic,
    biography: speaker.biography,
    photoUrl: speaker.photoUrl,
    email: speaker.email,
  };
};

export const pickSession = (session) => ({
  id: session._id,
  conferenceId: session.conferenceId,
  sessionTitle: session.sessionTitle,
  startsAt: session.startsAt,
  endsAt: session.endsAt,
  room: session.room,
  description: session.description,
  theme: pickTheme(session.themeId),
  speaker: pickSpeaker(session.speakerId),
});

export const pickSubmissionStatus = (submission) => ({
  submissionId: submission.submissionId,
  paperTitle: submission.paperTitle,
  status: submission.status,
  reviewComment: submission.reviewComment,
  submittedAt: submission.submittedAt,
  theme: pickTheme(submission.themeId),
});

export const pickCertificateCheck = (certificate) => ({
  valid: ACTIVE_CERTIFICATE_STATUSES.has(certificate.status),
  certificateId: certificate.certificateId,
  verificationCode: certificate.verificationCode,
  certificateType: certificate.certificateType,
  status: certificate.status,
  issueDate: certificate.issueDate,
  ownerName: certificate.ownerName,
  conference: certificate.conferenceId
    ? {
        id: certificate.conferenceId._id,
        name: certificate.conferenceId.name,
        startDate: certificate.conferenceId.startDate,
        endDate: certificate.conferenceId.endDate,
      }
    : null,
});
