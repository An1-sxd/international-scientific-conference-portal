import express from "express";

import Conference from "../../models/conference.model.js";
import { handleModelError, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.get("/conferences", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ startDate: -1 });
    return res.json({ success: true, data: conferences });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.get("/conferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid conference ID.");

    const conference = await Conference.findById(id);
    if (!conference) return sendError(res, 404, "Conference not found.");

    return res.json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/conferences", async (req, res) => {
  try {
    const conference = new Conference(req.body);
    await conference.save();
    return res.status(201).json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/conferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid conference ID.");

    const updateData = { ...req.body };
    delete updateData._id;

    const conference = await Conference.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!conference) return sendError(res, 404, "Conference not found.");

    return res.json({ success: true, data: conference });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/conferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid conference ID.");

    const conference = await Conference.findByIdAndDelete(id);
    if (!conference) return sendError(res, 404, "Conference not found.");

    return res.json({ success: true, message: "Conference deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
