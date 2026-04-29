import express from "express";

import Registration from "../../models/registration.model.js";
import Certificate from "../../models/certificate.model.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";
import { uploadPdf } from "../../middlewares/upload.middleware.js";
import { uploadBuffer, deleteAsset } from "../../services/cloudinary.service.js";
import { generateAndUploadCertificatePdf } from "../../services/certificate.service.js";

const router = express.Router();

router.get("/certificates", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const certificates = await Certificate.find({ conferenceId: conference._id })
      .populate("participantId")
      .populate("conferenceId")
      .populate("registrationIdRef")
      .sort({ issueDate: -1 });

    return res.json({ success: true, data: certificates });
  } catch (error) {
    return handleModelError(res, error);
  }
});

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
      certificateType: "PARTICIPANT",
      status: "GENERATED",
    };

    const certificate = new Certificate(certData);
    await certificate.save();

    return res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/certificates/generate-batch", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    // Find all confirmed registrations that don't yet have certificates
    const confirmedRegistrations = await Registration.find({
      conferenceId: conference._id,
      attendanceConfirmed: true,
    }).populate("participantId");

    const results = { generated: 0, skipped: 0, errors: [] };

    for (const reg of confirmedRegistrations) {
      try {
        const existingCert = await Certificate.findOne({ registrationIdRef: reg._id });
        if (existingCert) {
          results.skipped++;
          continue;
        }

        const participant = reg.participantId;
        if (!participant) {
          results.errors.push(`Missing participant for registration ${reg.registrationId}`);
          continue;
        }

        const cert = new Certificate({
          conferenceId: reg.conferenceId,
          registrationIdRef: reg._id,
          participantId: participant._id,
          ownerName: participant.fullName,
          ownerEmail: participant.email,
          certificateType: "PARTICIPANT",
          status: "GENERATED",
        });

        await cert.save();
        results.generated++;
      } catch (err) {
        results.errors.push(err.message);
      }
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.patch("/certificates/:id/upload-pdf", uploadPdf("pdf"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid certificate ID.");

    if (!req.file) {
      return sendError(res, 400, "No PDF file provided.");
    }

    const certificate = await Certificate.findById(id);
    if (!certificate) return sendError(res, 404, "Certificate not found.");

    const oldPdfPublicId = certificate.pdfPublicId;

    const uploadResult = await uploadBuffer(req.file.buffer, "conference-portal/certificates");
    
    certificate.pdfUrl = uploadResult.url;
    certificate.pdfPublicId = uploadResult.publicId;
    certificate.status = "ISSUED";

    await certificate.save();

    if (oldPdfPublicId) {
      await deleteAsset(oldPdfPublicId);
    }

    return res.json({ success: true, data: certificate });
  } catch (error) {
    return handleModelError(res, error);
  }
});

// ── Auto-generate PDF for a certificate (uses CDN cache) ──
router.post("/certificates/:id/generate-pdf", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid certificate ID.");

    const certificate = await generateAndUploadCertificatePdf(id);

    return res.json({ success: true, data: certificate });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
