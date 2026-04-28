import express from "express";

import Conference from "../../models/conference.model.js";
import Speaker from "../../models/speaker.model.js";
import Theme from "../../models/theme.model.js";
import Session from "../../models/session.model.js";
import { handleModelError, isValidObjectId, sendError } from "./helpers.js";

const router = express.Router();

// GET /conferences — list all conferences (public)
router.get("/conferences", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ startDate: -1 });

    return res.json({
      success: true,
      data: conferences,
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

// GET /conferences/:id — single conference with speakers, themes, sessions
router.get("/conferences/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, "Invalid conference id.");
    }

    const conference = await Conference.findById(req.params.id);
    if (!conference) {
      return sendError(res, 404, "Conference not found.");
    }

    const [speakers, themes, sessions] = await Promise.all([
      Speaker.find({ conferenceId: conference._id }).sort({ fullName: 1 }),
      Theme.find({ conferenceId: conference._id }).sort({ displayOrder: 1, label: 1 }),
      Session.find({ conferenceId: conference._id })
        .populate("themeId", "code label description displayOrder")
        .populate("speakerId", "fullName academicTitle affiliation country topic biography photoUrl email")
        .sort({ startsAt: 1 }),
    ]);

    return res.json({
      success: true,
      data: {
        conference,
        speakers,
        themes,
        sessions,
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
