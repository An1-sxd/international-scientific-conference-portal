import express from "express";

import Submission from "../../models/submission.model.js";
import Theme from "../../models/theme.model.js";
import {
  handleModelError,
  isValidObjectId,
  normalizeAuthors,
  pickTheme,
  resolveConference,
  sendError,
  validateAuthors,
} from "./helpers.js";
import { uploadPdf } from "../../middlewares/upload.middleware.js";
import { uploadBuffer } from "../../services/cloudinary.service.js";

const router = express.Router();

router.post("/submit-paper", uploadPdf("pdf"), async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    if (!req.body.themeId || !isValidObjectId(req.body.themeId)) {
      return sendError(res, 400, "A valid themeId is required.");
    }

    const paperTitle = typeof req.body.paperTitle === "string" ? req.body.paperTitle.trim() : "";
    const abstract = typeof req.body.abstract === "string" ? req.body.abstract.trim() : "";

    if (!paperTitle || !abstract) {
      return sendError(res, 400, "paperTitle and abstract are required.");
    }

    let parsedAuthors = req.body.authors;
    if (typeof parsedAuthors === "string") {
      try {
        parsedAuthors = JSON.parse(parsedAuthors);
      } catch (e) {
        return sendError(res, 400, "authors must be a valid JSON array.");
      }
    }

    const authorValidationMessage = validateAuthors(parsedAuthors);
    if (authorValidationMessage) {
      return sendError(res, 400, authorValidationMessage);
    }

    const theme = await Theme.findOne({
      _id: req.body.themeId,
      conferenceId: conference._id,
    });

    if (!theme) {
      return sendError(res, 404, "Theme not found for the selected conference.");
    }

    let finalPdfUrl = typeof req.body.pdfUrl === "string" ? req.body.pdfUrl.trim() : "";
    let finalPdfPublicId = "";

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, "conference-portal/submissions");
      finalPdfUrl = uploadResult.url;
      finalPdfPublicId = uploadResult.publicId;
    }

    const submission = await Submission.create({
      conferenceId: conference._id,
      themeId: theme._id,
      paperTitle,
      abstract,
      institution: typeof req.body.institution === "string" ? req.body.institution.trim() : "",
      country: typeof req.body.country === "string" ? req.body.country.trim() : "",
      pdfUrl: finalPdfUrl,
      pdfPublicId: finalPdfPublicId,
      authors: normalizeAuthors(parsedAuthors),
    });

    return res.status(201).json({
      success: true,
      data: {
        submissionId: submission.submissionId,
        paperTitle: submission.paperTitle,
        status: submission.status,
        submittedAt: submission.submittedAt,
        theme: pickTheme(theme),
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
