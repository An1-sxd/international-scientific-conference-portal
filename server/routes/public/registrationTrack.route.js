import express from "express";

import Registration from "../../models/registration.model.js";
import { handleModelError, sendError } from "./helpers.js";

const router = express.Router();

// ── Track registration by registrationId or email ──
router.get("/registrations/track", async (req, res) => {
  try {
    const registrationId =
      typeof req.query?.registrationId === "string" ? req.query.registrationId.trim().toUpperCase() : "";
    const email =
      typeof req.query?.email === "string" ? req.query.email.trim().toLowerCase() : "";

    if (!registrationId && !email) {
      return sendError(res, 400, "Provide registrationId or email.");
    }

    const query = registrationId
      ? { registrationId }
      : {};

    let registrations;

    if (registrationId) {
      const reg = await Registration.findOne({ registrationId })
        .populate("participantId", "fullName email participantType affiliation country")
        .populate("conferenceId", "name startDate endDate venue city");

      if (!reg) return sendError(res, 404, "Registration not found.");

      registrations = [reg];
    } else {
      // Find by participant email — need to find the participant first
      const Participant = (await import("../../models/participant.model.js")).default;
      const participant = await Participant.findOne({ email });
      if (!participant) return sendError(res, 404, "No registrations found for this email.");

      registrations = await Registration.find({ participantId: participant._id })
        .populate("participantId", "fullName email participantType affiliation country")
        .populate("conferenceId", "name startDate endDate venue city")
        .sort({ registeredAt: -1 });

      if (registrations.length === 0) {
        return sendError(res, 404, "No registrations found for this email.");
      }
    }

    const data = registrations.map((reg) => ({
      registrationId: reg.registrationId,
      registrationStatus: reg.registrationStatus,
      attendanceConfirmed: reg.attendanceConfirmed,
      registeredAt: reg.registeredAt,
      participant: reg.participantId
        ? {
            fullName: reg.participantId.fullName,
            email: reg.participantId.email,
            participantType: reg.participantId.participantType,
          }
        : null,
      conference: reg.conferenceId
        ? {
            name: reg.conferenceId.name,
            startDate: reg.conferenceId.startDate,
            endDate: reg.conferenceId.endDate,
            venue: reg.conferenceId.venue,
            city: reg.conferenceId.city,
          }
        : null,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
