import express from "express";

import Participant from "../../models/participant.model.js";
import { handleModelError, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.get("/participants", async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: participants });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.get("/participants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid participant ID.");

    const participant = await Participant.findById(id);
    if (!participant) return sendError(res, 404, "Participant not found.");

    return res.json({ success: true, data: participant });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/participants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid participant ID.");

    const updateData = { ...req.body };
    delete updateData._id;

    const participant = await Participant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!participant) return sendError(res, 404, "Participant not found.");

    return res.json({ success: true, data: participant });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/participants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid participant ID.");

    const participant = await Participant.findByIdAndDelete(id);
    if (!participant) return sendError(res, 404, "Participant not found.");

    return res.json({ success: true, message: "Participant deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
