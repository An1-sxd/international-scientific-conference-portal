import express from "express";

import Session from "../../models/session.model.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.get("/sessions", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const sessions = await Session.find({ conferenceId: conference._id })
      .populate("themeId")
      .populate("speakerId")
      .sort({ startsAt: 1 });

    return res.json({ success: true, data: sessions });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const sessionData = { ...req.body, conferenceId: conference._id };
    const session = new Session(sessionData);
    await session.save();

    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid session ID.");

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.conferenceId;

    const session = await Session.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("themeId")
      .populate("speakerId");

    if (!session) return sendError(res, 404, "Session not found.");

    return res.json({ success: true, data: session });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid session ID.");

    const session = await Session.findByIdAndDelete(id);
    if (!session) return sendError(res, 404, "Session not found.");

    return res.json({ success: true, message: "Session deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
