import express from "express";

import Submission from "../../models/submission.model.js";
import { handleModelError, resolveConference, sendError } from "../public/helpers.js";

const router = express.Router();

// ── Get accepted/published submissions (researchers) for a conference ──
router.get("/researches", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const submissions = await Submission.find({
      conferenceId: conference._id,
      status: { $in: ["ACCEPTED", "PUBLISHED"] },
    })
      .populate("themeId")
      .sort({ submittedAt: -1 });

    return res.json({ success: true, data: submissions });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
