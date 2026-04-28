import express from "express";

import Participant from "../../models/participant.model.js";
import Registration from "../../models/registration.model.js";
import { handleModelError, isValidObjectId, resolveConference, sendError } from "./helpers.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const affiliation = typeof req.body.affiliation === "string" ? req.body.affiliation.trim() : "";
    const country = typeof req.body.country === "string" ? req.body.country.trim() : "";
    const participantType = typeof req.body.participantType === "string" ? req.body.participantType.trim().toUpperCase() : "RESEARCHER";

    if (!fullName || !email) {
      return sendError(res, 400, "fullName and email are required.");
    }

    let participant = await Participant.findOne({ email });

    if (!participant) {
      participant = await Participant.create({
        fullName,
        email,
        phone,
        affiliation,
        country,
        participantType,
      });
    }

    const existingRegistration = await Registration.findOne({
      conferenceId: conference._id,
      participantId: participant._id,
    });

    if (existingRegistration) {
      return sendError(res, 409, "You are already registered for this conference.");
    }

    const registration = await Registration.create({
      conferenceId: conference._id,
      participantId: participant._id,
    });

    return res.status(201).json({
      success: true,
      data: {
        registrationId: registration.registrationId,
        registrationStatus: registration.registrationStatus,
        registeredAt: registration.registeredAt,
        conference: {
          id: conference._id,
          name: conference.name,
        },
        participant: {
          fullName: participant.fullName,
          email: participant.email,
        },
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
