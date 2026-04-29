import express from "express";

import Conference from "../../models/conference.model.js";
import Speaker from "../../models/speaker.model.js";
import Theme from "../../models/theme.model.js";
import Session from "../../models/session.model.js";
import Submission from "../../models/submission.model.js";
import Registration from "../../models/registration.model.js";
import Certificate from "../../models/certificate.model.js";
import Participant from "../../models/participant.model.js";
import { handleModelError, sendError, isValidObjectId } from "../public/helpers.js";
import { deleteAsset } from "../../services/cloudinary.service.js";

const router = express.Router();

router.get("/conferences", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ startDate: -1 });
    return res.json({ success: true, data: conferences });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.get("/conferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid conference ID.");

    const conference = await Conference.findById(id);
    if (!conference) return sendError(res, 404, "Conference not found.");

    return res.json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/conferences", async (req, res) => {
  try {
    const conference = new Conference(req.body);
    await conference.save();
    return res.status(201).json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/conferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid conference ID.");

    const updateData = { ...req.body };
    delete updateData._id;

    const conference = await Conference.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!conference) return sendError(res, 404, "Conference not found.");

    return res.json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/conferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid conference ID.");

    const conference = await Conference.findById(id);
    if (!conference) return sendError(res, 404, "Conference not found.");

    // ── 1. Delete speakers + their Cloudinary photos ──
    const speakers = await Speaker.find({ conferenceId: id });
    for (const speaker of speakers) {
      if (speaker.photoPublicId) await deleteAsset(speaker.photoPublicId);
    }
    await Speaker.deleteMany({ conferenceId: id });

    // ── 2. Delete themes ──
    await Theme.deleteMany({ conferenceId: id });

    // ── 3. Delete sessions ──
    await Session.deleteMany({ conferenceId: id });

    // ── 4. Delete submissions + their Cloudinary PDFs ──
    const submissions = await Submission.find({ conferenceId: id });
    for (const sub of submissions) {
      if (sub.pdfPublicId) await deleteAsset(sub.pdfPublicId);
    }
    await Submission.deleteMany({ conferenceId: id });

    // ── 5. Delete certificates + their Cloudinary PDFs ──
    const certificates = await Certificate.find({ conferenceId: id });
    for (const cert of certificates) {
      if (cert.pdfPublicId) await deleteAsset(cert.pdfPublicId);
    }
    await Certificate.deleteMany({ conferenceId: id });

    // ── 6. Find participant IDs from registrations, then delete registrations ──
    const registrations = await Registration.find({ conferenceId: id });
    const participantIds = [...new Set(registrations.map((r) => r.participantId.toString()))];
    await Registration.deleteMany({ conferenceId: id });

    // ── 7. Delete orphaned participants (no remaining registrations in any conference) ──
    for (const pId of participantIds) {
      const remaining = await Registration.countDocuments({ participantId: pId });
      if (remaining === 0) {
        await Participant.findByIdAndDelete(pId);
      }
    }

    // ── 8. Delete the conference itself ──
    await Conference.findByIdAndDelete(id);

    return res.json({ success: true, message: "Conference and all related data deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
