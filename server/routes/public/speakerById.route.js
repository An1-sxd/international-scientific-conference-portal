import express from "express";

import Speaker from "../../models/speaker.model.js";
import { handleModelError, isValidObjectId, sendError } from "./helpers.js";

const router = express.Router();

router.get("/speakers/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, "Invalid speaker id.");
    }

    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) {
      return sendError(res, 404, "Speaker not found.");
    }

    return res.json({ success: true, data: speaker });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
