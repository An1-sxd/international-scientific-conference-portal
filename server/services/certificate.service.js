import PDFDocument from "pdfkit";

import Certificate from "../models/certificate.model.js";
import Conference from "../models/conference.model.js";
import Participant from "../models/participant.model.js";
import { uploadBuffer } from "./cloudinary.service.js";

/**
 * Generates a certificate PDF and uploads it to Cloudinary.
 * If the certificate already has a pdfUrl (cached on CDN), returns it directly.
 *
 * @param {string} certificateId - MongoDB _id of the Certificate document
 * @returns {Promise<object>} The updated certificate document
 */
export const generateAndUploadCertificatePdf = async (certificateId) => {
  const certificate = await Certificate.findById(certificateId);
  if (!certificate) throw new Error("Certificate not found.");

  // ── CDN Cache: skip generation if PDF already exists ──
  if (certificate.pdfUrl) {
    return certificate;
  }

  // ── Fetch related data ──
  const conference = await Conference.findById(certificate.conferenceId);
  if (!conference) throw new Error("Associated conference not found.");

  const participant = await Participant.findById(certificate.participantId);
  if (!participant) throw new Error("Associated participant not found.");

  // ── Build the PDF in memory ──
  const pdfBuffer = await buildCertificatePdf({
    conferenceName: conference.name,
    venue: conference.venue || "",
    city: conference.city || "",
    country: conference.country || "",
    startDate: conference.startDate,
    endDate: conference.endDate,
    participantName: participant.fullName,
    participantType: participant.participantType || "Participant",
    certificateId: certificate.certificateId,
    verificationCode: certificate.verificationCode,
    issueDate: certificate.issueDate,
  });

  // ── Upload to Cloudinary ──
  const uploadResult = await uploadBuffer(
    pdfBuffer,
    "conference-portal/certificates",
    { resource_type: "raw" }
  );

  // ── Persist CDN URL ──
  certificate.pdfUrl = uploadResult.url;
  certificate.pdfPublicId = uploadResult.publicId;
  certificate.status = "ISSUED";
  await certificate.save();

  return certificate;
};

/* ─────────────────────────────────────────────────────────────
   Build an A4 landscape certificate PDF using PDFKit
   ───────────────────────────────────────────────────────────── */
function buildCertificatePdf({
  conferenceName,
  venue,
  city,
  country,
  startDate,
  endDate,
  participantName,
  participantType,
  certificateId,
  verificationCode,
  issueDate,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const H = doc.page.height;
      const fmtDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      // ── Background ──
      doc.rect(0, 0, W, H).fill("#0b0f1a");

      // ── Double border ──
      doc.rect(25, 25, W - 50, H - 50).lineWidth(2).stroke("#6366f1");
      doc.rect(31, 31, W - 62, H - 62).lineWidth(0.5).stroke("#374151");

      // ── Corner dots ──
      [[39, 39], [W - 39, 39], [39, H - 39], [W - 39, H - 39]].forEach(([x, y]) => {
        doc.circle(x, y, 3).fill("#6366f1");
      });

      // ── Top gradient line ──
      const grad1 = doc.linearGradient(200, 70, W - 200, 70);
      grad1.stop(0, "#6366f1").stop(1, "#06b6d4");
      doc.moveTo(200, 70).lineTo(W - 200, 70).lineWidth(2).stroke(grad1);

      // ── Header ──
      doc.fontSize(12).font("Helvetica").fillColor("#94a3b8");
      doc.text("BLIDA 1 PORTAL", 0, 85, { align: "center", width: W });

      doc.fontSize(36).font("Helvetica-Bold").fillColor("#f1f5f9");
      doc.text("CERTIFICATE", 0, 110, { align: "center", width: W });

      doc.fontSize(14).font("Helvetica").fillColor("#94a3b8");
      doc.text("OF ATTENDANCE", 0, 152, { align: "center", width: W, characterSpacing: 6 });

      // ── Divider ──
      doc.moveTo(W / 2 - 60, 180).lineTo(W / 2 + 60, 180).lineWidth(1).stroke("#374151");

      // ── Body ──
      doc.fontSize(12).font("Helvetica").fillColor("#94a3b8");
      doc.text("This is to certify that", 0, 200, { align: "center", width: W });

      doc.fontSize(28).font("Helvetica-Bold").fillColor("#818cf8");
      doc.text(participantName, 0, 225, { align: "center", width: W });

      const typeLabel = participantType.charAt(0).toUpperCase() + participantType.slice(1).toLowerCase();
      doc.fontSize(12).font("Helvetica").fillColor("#06b6d4");
      doc.text(typeLabel, 0, 262, { align: "center", width: W });

      doc.fontSize(12).font("Helvetica").fillColor("#94a3b8");
      doc.text("has successfully attended the conference", 0, 290, { align: "center", width: W });

      doc.fontSize(20).font("Helvetica-Bold").fillColor("#f1f5f9");
      doc.text(`"${conferenceName}"`, 60, 316, { align: "center", width: W - 120 });

      // ── Location & Date ──
      const locationParts = [venue, city, country].filter(Boolean).join(", ");
      const dateRange = `${fmtDate(startDate)} — ${fmtDate(endDate)}`;

      doc.fontSize(11).font("Helvetica").fillColor("#94a3b8");
      if (locationParts) {
        doc.text(locationParts, 0, 355, { align: "center", width: W });
      }
      doc.text(dateRange, 0, locationParts ? 372 : 355, { align: "center", width: W });

      // ── Bottom gradient line ──
      const grad2 = doc.linearGradient(200, 405, W - 200, 405);
      grad2.stop(0, "#6366f1").stop(1, "#06b6d4");
      doc.moveTo(200, 405).lineTo(W - 200, 405).lineWidth(1).stroke(grad2);

      // ── Footer info ──
      doc.fontSize(9).font("Helvetica").fillColor("#64748b");
      doc.text(
        `Issued: ${fmtDate(issueDate)}      Certificate ID: ${certificateId}      Verification: ${verificationCode}`,
        0, 420, { align: "center", width: W }
      );

      doc.fontSize(8).font("Helvetica").fillColor("#374151");
      doc.text(
        "This certificate is digitally generated by Blida1 Portal. Verify at blida1portal.com/verify-certificate",
        0, H - 55, { align: "center", width: W }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
