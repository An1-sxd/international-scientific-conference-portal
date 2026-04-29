import express from "express";

import Registration from "../../models/registration.model.js";
import { REGISTRATION_STATUSES } from "../../constants/enums.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.get("/registrations", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const registrations = await Registration.find({ conferenceId: conference._id })
      .populate("participantId")
      .populate("conferenceId")
      .sort({ registeredAt: -1 });

    return res.json({ success: true, data: registrations });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.patch("/registrations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid registration ID.");

    const { registrationStatus, attendanceConfirmed, notes } = req.body;

    if (registrationStatus && !REGISTRATION_STATUSES.includes(registrationStatus)) {
      return sendError(res, 400, "Invalid registration status.");
    }

    const updateData = {};
    if (registrationStatus) updateData.registrationStatus = registrationStatus;
    if (attendanceConfirmed !== undefined) updateData.attendanceConfirmed = attendanceConfirmed;
    if (notes !== undefined) updateData.notes = notes;

    const registration = await Registration.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("participantId")
      .populate("conferenceId");

    if (!registration) return sendError(res, 404, "Registration not found.");

    return res.json({ success: true, data: registration });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.patch("/registrations/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid registration ID.");

    const updates = {
      registrationStatus: "CONFIRMED",
      attendanceConfirmed: true
    };

    const registration = await Registration.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("participantId")
      .populate("conferenceId");

    if (!registration) return sendError(res, 404, "Registration not found.");

    return res.json({ success: true, data: registration });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
