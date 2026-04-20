import express from "express";

import Session from "../../models/session.model.js";
import { handleModelError, pickSession, resolveConference, sendError } from "./helpers.js";

const router = express.Router();

router.get("/agenda", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    const sessions = await Session.find({ conferenceId: conference._id })
      .populate("themeId", "code label description displayOrder")
      .populate("speakerId", "fullName academicTitle affiliation country topic biography photoUrl email")
      .sort({ startsAt: 1 });

    return res.json({
      success: true,
      data: sessions.map(pickSession),
      conference: {
        id: conference._id,
        name: conference.name,
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
