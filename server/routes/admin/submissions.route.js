import express from "express";

import Submission from "../../models/submission.model.js";
import { SUBMISSION_STATUSES } from "../../constants/enums.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";
import { sendSubmissionStatusEmail } from "../../services/email.service.js";
import { deleteAsset } from "../../services/cloudinary.service.js";

const router = express.Router();

router.get("/submissions", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const submissions = await Submission.find({ conferenceId: conference._id })
      .populate("themeId")
      .sort({ submittedAt: -1 });

    return res.json({ success: true, data: submissions });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.patch("/submissions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid submission ID.");

    const { status, reviewComment } = req.body;

    if (status && !SUBMISSION_STATUSES.includes(status)) {
      return sendError(res, 400, "Invalid submission status.");
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (reviewComment !== undefined) updateData.reviewComment = reviewComment;

    const submission = await Submission.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("themeId");

    if (!submission) return sendError(res, 404, "Submission not found.");

    // Send email notification (fire-and-forget)
    try {
      if (status) {
        await sendSubmissionStatusEmail(submission);
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError.message);
    }

    return res.json({ success: true, data: submission });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/submissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid submission ID.");

    const submission = await Submission.findById(id);
    if (!submission) return sendError(res, 404, "Submission not found.");

    // Clean up the PDF from Cloudinary
    if (submission.pdfPublicId) {
      await deleteAsset(submission.pdfPublicId);
    }

    // Delete the submission
    await submission.deleteOne();

    return res.json({ success: true, message: "Submission deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
