import express from "express";

import Speaker from "../../models/speaker.model.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.get("/speakers", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const speakers = await Speaker.find({ conferenceId: conference._id }).sort({ createdAt: -1 });

    return res.json({ success: true, data: speakers });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/speakers", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const speakerData = { ...req.body, conferenceId: conference._id };
    const speaker = new Speaker(speakerData);
    await speaker.save();

    return res.status(201).json({ success: true, data: speaker });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/speakers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid speaker ID.");

    // Remove immutable fields from update
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.conferenceId;

    const speaker = await Speaker.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!speaker) return sendError(res, 404, "Speaker not found.");

    return res.json({ success: true, data: speaker });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/speakers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid speaker ID.");

    const speaker = await Speaker.findByIdAndDelete(id);
    if (!speaker) return sendError(res, 404, "Speaker not found.");

    return res.json({ success: true, message: "Speaker deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
