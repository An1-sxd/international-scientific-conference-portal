import express from "express";

import Speaker from "../../models/speaker.model.js";
import Session from "../../models/session.model.js";
import Submission from "../../models/submission.model.js";
import Registration from "../../models/registration.model.js";
import Certificate from "../../models/certificate.model.js";
import { handleModelError, resolveConference, sendError } from "../public/helpers.js";

const router = express.Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) {
      return sendError(res, status, message);
    }

    const conferenceId = conference._id;

    // Run aggregate/count queries concurrently
    const [
      totalSpeakers,
      totalSessions,
      totalSubmissions,
      submissionsByStatusRaw,
      totalRegistrations,
      confirmedRegistrations,
      totalCertificates,
    ] = await Promise.all([
      Speaker.countDocuments({ conferenceId }),
      Session.countDocuments({ conferenceId }),
      Submission.countDocuments({ conferenceId }),
      Submission.aggregate([
        { $match: { conferenceId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Registration.countDocuments({ conferenceId }),
      Registration.countDocuments({ conferenceId, registrationStatus: "CONFIRMED" }),
      Certificate.countDocuments({ conferenceId }),
    ]);

    // Format aggregate results into an object { PENDING: 2, ACCEPTED: 1, ... }
    const submissionsByStatus = submissionsByStatusRaw.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return res.json({
      success: true,
      conference: {
        id: conference._id,
        name: conference.name,
      },
      stats: {
        totalSpeakers,
        totalSessions,
        totalSubmissions,
        submissionsByStatus,
        totalRegistrations,
        confirmedRegistrations,
        totalCertificates,
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
