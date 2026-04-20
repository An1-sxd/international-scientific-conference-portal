import express from "express";

import Submission from "../../models/submission.model.js";
import {
  escapeRegex,
  handleModelError,
  normalizeEmail,
  pickSubmissionStatus,
  sendError,
} from "./helpers.js";

const router = express.Router();

router.get("/submissions/status", async (req, res) => {
  try {
    const submissionId =
      typeof req.query.submissionId === "string" ? req.query.submissionId.trim() : "";
    const email = normalizeEmail(req.query.email);
    const paperTitle = typeof req.query.paperTitle === "string" ? req.query.paperTitle.trim() : "";

    if (!submissionId && (!email || !paperTitle)) {
      return sendError(
        res,
        400,
        "Provide submissionId, or provide both email and paperTitle."
      );
    }

    const query = submissionId
      ? { submissionId: submissionId.toUpperCase() }
      : {
          "authors.email": email,
          paperTitle: new RegExp(`^${escapeRegex(paperTitle)}$`, "i"),
        };

    const submission = await Submission.findOne(query).populate(
      "themeId",
      "code label description displayOrder"
    );

    if (!submission) {
      return sendError(res, 404, "Submission not found.");
    }

    return res.json({
      success: true,
      data: pickSubmissionStatus(submission),
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
