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

// ── Check certificate status by registrationId or email ──
// Returns registrations with certificateStatus: 'not_accepted' | 'not_ready' | 'ready'
router.get("/certificates/my", async (req, res) => {
  try {
    const email = typeof req.query?.email === "string" ? normalizeEmail(req.query.email) : "";
    const registrationIdQuery =
      typeof req.query?.registrationId === "string"
        ? req.query.registrationId.trim().toUpperCase()
        : "";

    if (!email && !registrationIdQuery) {
      return sendError(res, 400, "Email or registration ID is required.");
    }

    let registrations;

    if (registrationIdQuery) {
      // Find by public registration ID
      const reg = await Registration.findOne({ registrationId: registrationIdQuery })
        .populate("conferenceId", "name startDate endDate venue city country")
        .populate("participantId");

      if (!reg) return sendError(res, 404, "Registration not found.");
      registrations = [reg];
    } else {
      // Find by participant email
      const participant = await Participant.findOne({ email });
      if (!participant) {
        return sendError(res, 404, "No participant found with this email.");
      }

      registrations = await Registration.find({ participantId: participant._id })
        .populate("conferenceId", "name startDate endDate venue city country")
        .populate("participantId");

      if (registrations.length === 0) {
        return sendError(res, 404, "No registrations found.");
      }
    }

    const results = [];

    for (const reg of registrations) {
      const participant = reg.participantId;

      const entry = {
        conferenceId: reg.conferenceId?._id,
        conferenceName: reg.conferenceId?.name,
        venue: reg.conferenceId?.venue,
        city: reg.conferenceId?.city,
        startDate: reg.conferenceId?.startDate,
        endDate: reg.conferenceId?.endDate,
        registrationId: reg.registrationId,
        registrationStatus: reg.registrationStatus,
        certificateStatus: null,
        certificate: null,
      };

      if (reg.registrationStatus === "REFUSED") {
        // Registration was refused — not accepted
        entry.certificateStatus = "not_accepted";
      } else if (reg.registrationStatus === "PENDING") {
        // Still pending review
        entry.certificateStatus = "not_ready";
      } else {
        // Accepted — certificate is ready
        entry.certificateStatus = "ready";

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
          try {
            cert = await generateAndUploadCertificatePdf(cert._id);
          } catch (_) {
            // PDF generation may fail (e.g. no service configured), certificate data is still valid
          }
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
