import express from "express";

import Speaker from "../../models/speaker.model.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";
import { uploadPhoto } from "../../middlewares/upload.middleware.js";
import { uploadBuffer, deleteAsset } from "../../services/cloudinary.service.js";

const router = express.Router();

router.get("/speakers", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const speakers = await Speaker.find({ conferenceId: conference._id }).sort({ createdAt: -1 });

    return res.json({ success: true, data: speakers });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/speakers", uploadPhoto("photo"), async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const speakerData = { ...req.body, conferenceId: conference._id };
    
    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, "conference-portal/speakers");
      speakerData.photoUrl = uploadResult.url;
      speakerData.photoPublicId = uploadResult.publicId;
    }

    const speaker = new Speaker(speakerData);
    await speaker.save();

    return res.status(201).json({ success: true, data: speaker });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/speakers/:id", uploadPhoto("photo"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid speaker ID.");

    // Remove immutable fields from update
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.conferenceId;

    const existingSpeaker = await Speaker.findById(id);
    if (!existingSpeaker) return sendError(res, 404, "Speaker not found.");

    let oldPhotoPublicId = null;

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, "conference-portal/speakers");
      updateData.photoUrl = uploadResult.url;
      updateData.photoPublicId = uploadResult.publicId;
      oldPhotoPublicId = existingSpeaker.photoPublicId;
    }

    const speaker = await Speaker.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (oldPhotoPublicId) {
      await deleteAsset(oldPhotoPublicId);
    }

    return res.json({ success: true, data: speaker });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/speakers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid speaker ID.");

    const speaker = await Speaker.findByIdAndDelete(id);
    if (!speaker) return sendError(res, 404, "Speaker not found.");

    if (speaker.photoPublicId) {
      await deleteAsset(speaker.photoPublicId);
    }

    return res.json({ success: true, message: "Speaker deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
