import express from "express";

import Certificate from "../../models/certificate.model.js";
import { handleModelError, pickCertificateCheck, sendError } from "./helpers.js";

const router = express.Router();

router.get("/certificates/check", async (req, res) => {
  console.log(req.query)
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

    const certificate = await Certificate.findOne(query).populate(
      "conferenceId",
      "name startDate endDate"
    );

    if (!certificate) {
      return sendError(res, 404, "Certificate not found.");
    }

    return res.json({
      success: true,
      data: pickCertificateCheck(certificate),
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
