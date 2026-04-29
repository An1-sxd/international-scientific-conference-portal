import puppeteer from "puppeteer";

import Certificate from "../models/certificate.model.js";
import Conference from "../models/conference.model.js";
import Participant from "../models/participant.model.js";
import { uploadBuffer } from "./cloudinary.service.js";

/* ─────────────────────────────────────────────────────────────
   HTML Certificate Template
   ───────────────────────────────────────────────────────────── */

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/**
 * Builds the full HTML string for a certificate.
 * All data is injected into a single self-contained page.
 */
function buildCertificateHtml({
  conferenceName,
  conferenceSlogan,
  venue,
  city,
  country,
  startDate,
  endDate,
  participantName,
  participantEmail,
  participantAffiliation,
  participantType,
  certificateId,
  verificationCode,
  issueDate,
}) {
  const locationParts = [venue, city, country].filter(Boolean).join(", ");
  const dateRange = `${fmtDate(startDate)} — ${fmtDate(endDate)}`;
  const typeLabel =
    participantType.charAt(0).toUpperCase() +
    participantType.slice(1).toLowerCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 1122px;
    height: 794px;
    overflow: hidden;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: #0b0f1a;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cert {
    width: 1122px;
    height: 794px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0b0f1a 0%, #131832 50%, #0b0f1a 100%);
  }

  /* ── Decorative background elements ── */
  .cert::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
  }
  .cert::after {
    content: '';
    position: absolute;
    bottom: -200px;
    left: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%);
  }

  /* ── Outer border ── */
  .border-outer {
    position: absolute;
    top: 20px; left: 20px; right: 20px; bottom: 20px;
    border: 2px solid rgba(99,102,241,0.5);
    border-radius: 12px;
    pointer-events: none;
  }
  .border-inner {
    position: absolute;
    top: 28px; left: 28px; right: 28px; bottom: 28px;
    border: 1px solid rgba(55,65,81,0.6);
    border-radius: 8px;
    pointer-events: none;
  }

  /* ── Corner accents ── */
  .corner {
    position: absolute;
    width: 24px;
    height: 24px;
  }
  .corner::before, .corner::after {
    content: '';
    position: absolute;
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    border-radius: 1px;
  }
  .corner--tl { top: 34px; left: 34px; }
  .corner--tl::before { width: 24px; height: 2px; top: 0; left: 0; }
  .corner--tl::after { width: 2px; height: 24px; top: 0; left: 0; }
  .corner--tr { top: 34px; right: 34px; }
  .corner--tr::before { width: 24px; height: 2px; top: 0; right: 0; }
  .corner--tr::after { width: 2px; height: 24px; top: 0; right: 0; }
  .corner--bl { bottom: 34px; left: 34px; }
  .corner--bl::before { width: 24px; height: 2px; bottom: 0; left: 0; }
  .corner--bl::after { width: 2px; height: 24px; bottom: 0; left: 0; }
  .corner--br { bottom: 34px; right: 34px; }
  .corner--br::before { width: 24px; height: 2px; bottom: 0; right: 0; }
  .corner--br::after { width: 2px; height: 24px; bottom: 0; right: 0; }

  /* ── Content ── */
  .content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 60px 80px;
    text-align: center;
  }

  /* ── Top gradient line ── */
  .gradient-line {
    width: 400px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #6366f1, #06b6d4, transparent);
    margin-bottom: 24px;
  }

  /* ── Header ── */
  .institution {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .title {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 800;
    background: linear-gradient(135deg, #f1f5f9, #c7d2fe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 3px;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 8px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 20px;
  }

  /* ── Divider ── */
  .divider {
    width: 100px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #374151, transparent);
    margin: 8px auto 20px;
  }

  /* ── Body ── */
  .preamble {
    font-size: 14px;
    font-weight: 400;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .participant-name {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, #818cf8, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
  }

  .participant-meta {
    font-size: 12px;
    font-weight: 500;
    color: #06b6d4;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .participant-affiliation {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 18px;
  }

  .attended-text {
    font-size: 14px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .conference-name {
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 6px;
    padding: 0 40px;
    line-height: 1.3;
  }

  .conference-slogan {
    font-size: 12px;
    font-style: italic;
    color: #64748b;
    margin-bottom: 10px;
  }

  .conference-details {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.6;
  }

  /* ── Bottom gradient line ── */
  .gradient-line-bottom {
    width: 400px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1, #06b6d4, transparent);
    margin: 20px auto 16px;
  }

  /* ── Footer ── */
  .footer-info {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 8px;
  }
  .footer-item {
    text-align: center;
  }
  .footer-item__label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #475569;
    margin-bottom: 2px;
  }
  .footer-item__value {
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    font-family: 'Inter', monospace;
  }

  .verification-note {
    font-size: 9px;
    color: #374151;
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>
<div class="cert">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="corner corner--tl"></div>
  <div class="corner corner--tr"></div>
  <div class="corner corner--bl"></div>
  <div class="corner corner--br"></div>

  <div class="content">
    <div class="gradient-line"></div>

    <div class="institution">Blida 1 Portal</div>
    <div class="title">CERTIFICATE</div>
    <div class="subtitle">of Attendance</div>

    <div class="divider"></div>

    <div class="preamble">This is to certify that</div>
    <div class="participant-name">${escapeHtml(participantName)}</div>
    <div class="participant-meta">${escapeHtml(typeLabel)}</div>
    ${participantAffiliation ? `<div class="participant-affiliation">${escapeHtml(participantAffiliation)}</div>` : '<div style="margin-bottom:18px"></div>'}

    <div class="attended-text">has successfully attended the conference</div>
    <div class="conference-name">"${escapeHtml(conferenceName)}"</div>
    ${conferenceSlogan ? `<div class="conference-slogan">${escapeHtml(conferenceSlogan)}</div>` : ""}
    <div class="conference-details">
      ${locationParts ? `${escapeHtml(locationParts)}<br>` : ""}
      ${escapeHtml(dateRange)}
    </div>

    <div class="gradient-line-bottom"></div>

    <div class="footer-info">
      <div class="footer-item">
        <div class="footer-item__label">Issued</div>
        <div class="footer-item__value">${escapeHtml(fmtDate(issueDate))}</div>
      </div>
      <div class="footer-item">
        <div class="footer-item__label">Certificate ID</div>
        <div class="footer-item__value">${escapeHtml(certificateId)}</div>
      </div>
      <div class="footer-item">
        <div class="footer-item__label">Verification</div>
        <div class="footer-item__value">${escapeHtml(verificationCode)}</div>
      </div>
    </div>

    <div class="verification-note">
      This certificate is digitally generated by Blida1 Portal — Verify at blida1portal.com/verify-certificate
    </div>
  </div>
</div>
</body>
</html>`;
}

/** Escape HTML entities to prevent XSS in the template */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ─────────────────────────────────────────────────────────────
   PDF Generation via Puppeteer
   ───────────────────────────────────────────────────────────── */

/** Shared browser instance (lazy singleton) */
let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

/**
 * Renders the HTML certificate template to a PDF buffer using Puppeteer.
 * Returns a proper PDF buffer (valid .pdf file).
 */
async function buildCertificatePdf(data) {
  const html = buildCertificateHtml(data);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "1122px",
      height: "794px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/* ─────────────────────────────────────────────────────────────
   Main export: generate + upload
   ───────────────────────────────────────────────────────────── */

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

  // ── Build the PDF in memory via Puppeteer ──
  const pdfBuffer = await buildCertificatePdf({
    conferenceName: conference.name,
    conferenceSlogan: conference.slogan || "",
    venue: conference.venue || "",
    city: conference.city || "",
    country: conference.country || "",
    startDate: conference.startDate,
    endDate: conference.endDate,
    participantName: participant.fullName,
    participantEmail: participant.email || "",
    participantAffiliation: participant.affiliation || "",
    participantType: participant.participantType || "Participant",
    certificateId: certificate.certificateId,
    verificationCode: certificate.verificationCode,
    issueDate: certificate.issueDate,
  });

  // ── Upload to Cloudinary as a proper PDF ──
  const uploadResult = await uploadBuffer(
    pdfBuffer,
    "conference-portal/certificates",
    {
      resource_type: "raw",
      format: "pdf",
      public_id: `cert_${certificate.certificateId.replace(/[^a-zA-Z0-9-]/g, "_")}`,
    }
  );

  // ── Persist CDN URL ──
  certificate.pdfUrl = uploadResult.url;
  certificate.pdfPublicId = uploadResult.publicId;
  certificate.status = "ISSUED";
  await certificate.save();

  return certificate;
};
