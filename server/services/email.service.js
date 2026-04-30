import nodemailer from "nodemailer";

// ── Transporter (Gmail App Password) ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PW,
  },
});

// ── Shared HTML wrapper ──
const htmlWrapper = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a237e 0%,#3949ab 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                🎓 International Scientific Conference
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e8eaed;">
              <p style="margin:0;font-size:12px;color:#9e9e9e;">
                This is an automated notification. Please do not reply to this email.
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#9e9e9e;">
                © ${new Date().getFullYear()} International Scientific Conference Portal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Status badge color helper ──
const statusColor = (status) => {
  const colors = {
    PENDING: "#ff9800",
    ACCEPTED: "#4caf50",
    REFUSED: "#f44336",
    REJECTED: "#f44336",
    UNDER_REVIEW: "#2196f3",
    PUBLISHED: "#673ab7",
  };
  return colors[status] || "#757575";
};

const statusBadge = (status) =>
  `<span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${statusColor(status)};color:#fff;font-size:13px;font-weight:600;letter-spacing:0.3px;">${status.replace(/_/g, " ")}</span>`;

// ── Info row helper ──
const infoRow = (label, value) =>
  value
    ? `<tr>
        <td style="padding:8px 12px;font-size:14px;color:#757575;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:8px 12px;font-size:14px;color:#333;">${value}</td>
      </tr>`
    : "";

// ───────────────────────────────────────────────────────────
// 1. Registration Status Update
// ───────────────────────────────────────────────────────────
export async function sendRegistrationStatusEmail(registration) {
  const participant = registration.participantId;
  const conference = registration.conferenceId;

  if (!participant?.email) return;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a237e;font-size:20px;">Registration Status Update</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Dear <strong>${participant.fullName}</strong>, your registration status has been updated.
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:#333;">
      New Status: ${statusBadge(registration.registrationStatus)}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin:16px 0 20px;">
      ${infoRow("Registration ID", registration.registrationId)}
      ${infoRow("Conference", conference?.name || "—")}
      ${infoRow("Full Name", participant.fullName)}
      ${infoRow("Email", participant.email)}
      ${infoRow("Affiliation", participant.affiliation)}
      ${infoRow("Type", participant.participantType)}
      ${infoRow("Registered At", registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—")}
      ${infoRow("Notes", registration.notes)}
    </table>

    <p style="margin:0;font-size:14px;color:#888;line-height:1.5;">
      If you have any questions, please contact the conference organizers.
    </p>
  `;

  await transporter.sendMail({
    from: `"Conference Portal" <${process.env.EMAIL_USER}>`,
    to: participant.email,
    subject: `Registration ${registration.registrationStatus} – ${conference?.name || "Conference"}`,
    html: htmlWrapper("Registration Status Update", body),
  });
}

// ───────────────────────────────────────────────────────────
// 2. Submission Status Update
// ───────────────────────────────────────────────────────────
export async function sendSubmissionStatusEmail(submission) {
  // Collect all unique author emails
  const allEmails = [...new Set((submission.authors || []).map((a) => a.email).filter(Boolean))];

  if (allEmails.length === 0) return;

  const correspondingAuthor = submission.authors?.find((a) => a.isCorresponding);
  const greetingName = correspondingAuthor?.fullName || "Authors";

  const theme = submission.themeId;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a237e;font-size:20px;">Submission Status Update</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Dear <strong>${greetingName}</strong> and co-authors, your submission status has been updated.
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:#333;">
      New Status: ${statusBadge(submission.status)}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin:16px 0 20px;">
      ${infoRow("Submission ID", submission.submissionId)}
      ${infoRow("Paper Title", submission.paperTitle)}
      ${infoRow("Theme", theme?.name || "—")}
      ${infoRow("Institution", submission.institution)}
      ${infoRow("Country", submission.country)}
      ${infoRow("Submitted At", submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—")}
      ${infoRow("Review Comment", submission.reviewComment)}
    </table>

    <h3 style="margin:20px 0 8px;color:#1a237e;font-size:16px;">Authors</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin:0 0 20px;">
      ${(submission.authors || [])
        .sort((a, b) => a.authorOrder - b.authorOrder)
        .map(
          (author) =>
            `<tr>
              <td style="padding:8px 12px;font-size:14px;color:#333;">
                ${author.authorOrder}. <strong>${author.fullName}</strong>${author.isCorresponding ? ' <span style="color:#1a237e;font-size:12px;">(Corresponding)</span>' : ""}
                <br/><span style="color:#757575;font-size:13px;">${author.email}${author.affiliation ? ` · ${author.affiliation}` : ""}</span>
              </td>
            </tr>`
        )
        .join("")}
    </table>

    <p style="margin:0;font-size:14px;color:#888;line-height:1.5;">
      If you have any questions, please contact the conference organizers.
    </p>
  `;

  await transporter.sendMail({
    from: `"Conference Portal" <${process.env.EMAIL_USER}>`,
    to: allEmails.join(", "),
    subject: `Submission ${submission.status} – ${submission.paperTitle}`,
    html: htmlWrapper("Submission Status Update", body),
  });
}

// ───────────────────────────────────────────────────────────
// 3. Certificate Ready (Participant Marked as Present)
// ───────────────────────────────────────────────────────────
export async function sendCertificateReadyEmail(registration) {
  const participant = registration.participantId;
  const conference = registration.conferenceId;

  if (!participant?.email) return;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a237e;font-size:20px;">🎉 Your Certificate is Ready!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Dear <strong>${participant.fullName}</strong>, your attendance has been confirmed and your certificate of participation is now ready.
    </p>

    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;padding:16px 28px;background:linear-gradient(135deg,#4caf50 0%,#2e7d32 100%);border-radius:10px;color:#fff;font-size:16px;font-weight:700;">
        ✅ Attendance Confirmed
      </div>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin:16px 0 20px;">
      ${infoRow("Registration ID", registration.registrationId)}
      ${infoRow("Conference", conference?.name || "—")}
      ${infoRow("Full Name", participant.fullName)}
      ${infoRow("Email", participant.email)}
      ${infoRow("Affiliation", participant.affiliation)}
    </table>

    <p style="margin:0 0 12px;font-size:15px;color:#333;line-height:1.6;">
      You can download your certificate from the conference platform using your registration ID.
    </p>

    <p style="margin:0;font-size:14px;color:#888;line-height:1.5;">
      If you have any questions, please contact the conference organizers.
    </p>
  `;

  await transporter.sendMail({
    from: `"Conference Portal" <${process.env.EMAIL_USER}>`,
    to: participant.email,
    subject: `🎓 Certificate Ready – ${conference?.name || "Conference"}`,
    html: htmlWrapper("Certificate Ready", body),
  });
}
