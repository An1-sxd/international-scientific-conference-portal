import express from "express";

import Certificate from "../../models/certificate.model.js";
import Registration from "../../models/registration.model.js";
import Participant from "../../models/participant.model.js";
import { handleModelError, pickCertificateCheck, sendError, normalizeEmail } from "./helpers.js";
import { generateAndUploadCertificatePdf } from "../../services/certificate.service.js";

const router = express.Router();

// ── Verify certificate by ID or verification code ──
router.get("/certificates/check", async (req, res) => {
  try {
    const certificateId =
      typeof req.query?.certificateId === "string" ? req.query?.certificateId.trim().toUpperCase() : "";
    const verificationCode =
      typeof req.query?.verificationCode === "string"
        ? req.query?.verificationCode.trim().toUpperCase()
        : "";

    if (!certificateId && !verificationCode) {
      return sendError(res, 400, "Provide certificateId or verificationCode.");
    }

    const query = certificateId ? { certificateId } : { verificationCode };

    let certificate = await Certificate.findOne(query).populate(
      "conferenceId",
      "name startDate endDate venue city country"
    );

    if (!certificate) {
      return sendError(res, 404, "Certificate not found.");
    }

    // Auto-generate PDF if not on CDN yet
    if (!certificate.pdfUrl) {
      await generateAndUploadCertificatePdf(certificate._id);
      certificate = await Certificate.findById(certificate._id).populate(
        "conferenceId",
        "name startDate endDate venue city country"
      );
    }

    return res.json({
      success: true,
      data: pickCertificateCheck(certificate),
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

// ── Participant checks his certificates by email ──
// Returns all registrations + auto-generates certificates for attended conferences
router.get("/certificates/my", async (req, res) => {
  try {
    const email = typeof req.query?.email === "string" ? normalizeEmail(req.query.email) : "";

    if (!email) {
      return sendError(res, 400, "Email is required.");
    }

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return sendError(res, 404, "No participant found with this email.");
    }

    const registrations = await Registration.find({ participantId: participant._id })
      .populate("conferenceId", "name startDate endDate venue city country");

    if (registrations.length === 0) {
      return sendError(res, 404, "No registrations found.");
    }

    const results = [];

    for (const reg of registrations) {
      const entry = {
        conferenceId: reg.conferenceId?._id,
        conferenceName: reg.conferenceId?.name,
        venue: reg.conferenceId?.venue,
        city: reg.conferenceId?.city,
        startDate: reg.conferenceId?.startDate,
        endDate: reg.conferenceId?.endDate,
        registrationId: reg.registrationId,
        attendanceConfirmed: reg.attendanceConfirmed,
        certificate: null,
      };

      if (reg.attendanceConfirmed) {
        // Find or create certificate record
        let cert = await Certificate.findOne({ registrationIdRef: reg._id });

        if (!cert) {
          cert = new Certificate({
            conferenceId: reg.conferenceId._id,
            registrationIdRef: reg._id,
            participantId: participant._id,
            ownerName: participant.fullName,
            ownerEmail: participant.email,
            certificateType: "PARTICIPANT",
            status: "GENERATED",
          });
          await cert.save();
        }

        // Auto-generate PDF if not cached on CDN
        if (!cert.pdfUrl) {
          cert = await generateAndUploadCertificatePdf(cert._id);
        }

        entry.certificate = {
          certificateId: cert.certificateId,
          verificationCode: cert.verificationCode,
          status: cert.status,
          pdfUrl: cert.pdfUrl,
          issueDate: cert.issueDate,
        };
      }

      results.push(entry);
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
