import express from "express";

import { getActiveConference, handleModelError, sendError } from "./helpers.js";

const router = express.Router();

router.get("/conference/active", async (req, res) => {
  try {
    const conference = await getActiveConference();

    if (!conference) {
      return sendError(res, 404, "Active conference not found.");
    }

    return res.json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
