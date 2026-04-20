import express from "express";

import Speaker from "../../models/speaker.model.js";
import { handleModelError, resolveConference, sendError } from "./helpers.js";

const router = express.Router();

router.get("/speakers", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    const speakers = await Speaker.find({ conferenceId: conference._id }).sort({
      fullName: 1,
    });

    return res.json({
      success: true,
      data: speakers,
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
