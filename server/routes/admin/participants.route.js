import express from "express";

import Participant from "../../models/participant.model.js";
import Registration from "../../models/registration.model.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

// ── Get participants for a specific conference (only those with confirmed registrations) ──
router.get("/participants", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    // Find all registrations (not cancelled) for this conference
    const registrations = await Registration.find({
      conferenceId: conference._id,
      registrationStatus: { $ne: "CANCELLED" },
    }).populate("participantId");

    // Extract unique participants
    const participantMap = new Map();
    for (const reg of registrations) {
      if (reg.participantId && !participantMap.has(reg.participantId._id.toString())) {
        participantMap.set(reg.participantId._id.toString(), {
          ...reg.participantId.toObject(),
          registrationStatus: reg.registrationStatus,
          attendanceConfirmed: reg.attendanceConfirmed,
          registrationId: reg.registrationId,
          registrationRef: reg._id,
        });
      }
    }

    const data = Array.from(participantMap.values());

    return res.json({ success: true, data });
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
