import express from "express";

import Theme from "../../models/theme.model.js";
import { handleModelError, resolveConference, sendError } from "./helpers.js";

const router = express.Router();

router.get("/themes", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    const themes = await Theme.find({ conferenceId: conference._id }).sort({
      displayOrder: 1,
      label: 1,
    });

    return res.json({
      success: true,
      data: themes,
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
