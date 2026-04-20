import express from "express";

import Registration from "../../models/registration.model.js";
import Certificate from "../../models/certificate.model.js";
import { handleModelError, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.post("/certificates/generate", async (req, res) => {
  try {
    const { registrationIdRef } = req.body;

    if (!registrationIdRef || !isValidObjectId(registrationIdRef)) {
      return sendError(res, 400, "Valid registrationIdRef is required.");
    }

    const registration = await Registration.findById(registrationIdRef).populate("participantId");
    
    if (!registration) {
      return sendError(res, 404, "Registration not found.");
    }
    
    if (registration.registrationStatus !== "CONFIRMED" && !registration.attendanceConfirmed) {
      return sendError(res, 400, "Cannot generate certificate: attendance is not confirmed.");
    }

    // Check if certificate already exists for this registration
    const existingCert = await Certificate.findOne({ registrationIdRef });
    if (existingCert) {
      return sendError(res, 409, "Certificate already generated for this registration.", {
        certificate: existingCert
      });
    }

    const participant = registration.participantId;
    if (!participant) {
      return sendError(res, 400, "Associated participant data is missing.");
    }

    const certData = {
      conferenceId: registration.conferenceId,
      registrationIdRef: registration._id,
      participantId: participant._id,
      ownerName: participant.fullName,
      ownerEmail: participant.email,
      certificateType: "PARTICIPANT", // Could be dynamic if needed
      status: "GENERATED",
    };

    const certificate = new Certificate(certData);
    await certificate.save();

    return res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
