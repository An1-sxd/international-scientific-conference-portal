import express from "express";

import Speaker from "../../models/speaker.model.js";
import Conference from "../../models/conference.model.js";
import { handleModelError, isValidObjectId, sendError } from "./helpers.js";

const router = express.Router();

router.get("/speakers", async (req, res) => {
  try {
    const conferenceId =
      typeof req.query?.conferenceId === "string" ? req.query.conferenceId.trim() : "";

    const query = {};
    let conference = null;

    if (conferenceId) {
      if (!isValidObjectId(conferenceId)) {
        return sendError(res, 400, "Invalid conferenceId.");
      }
      conference = await Conference.findById(conferenceId);
      if (!conference) {
        return sendError(res, 404, "Conference not found.");
      }
      query.conferenceId = conference._id;
    }

    const speakers = await Speaker.find(query)
      .populate("conferenceId", "name")
      .sort({ fullName: 1 });

    const response = { success: true, data: speakers };
    if (conference) {
      response.conference = { id: conference._id, name: conference.name };
    }

    return res.json(response);
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
