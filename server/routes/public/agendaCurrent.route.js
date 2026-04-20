import express from "express";

import Session from "../../models/session.model.js";
import { handleModelError, pickSession, resolveConference, sendError } from "./helpers.js";

const router = express.Router();

router.get("/agenda/current", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    const now = new Date();
    const session = await Session.findOne({
      conferenceId: conference._id,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .populate("themeId", "code label description displayOrder")
      .populate("speakerId", "fullName academicTitle affiliation country topic biography photoUrl email");

    if (!session) {
      return res.json({
        success: true,
        data: null,
        message: "No session is currently active.",
      });
    }

    return res.json({ success: true, data: pickSession(session) });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
