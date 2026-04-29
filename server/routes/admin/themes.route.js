import express from "express";

import Theme from "../../models/theme.model.js";
import { handleModelError, resolveConference, sendError, isValidObjectId } from "../public/helpers.js";

const router = express.Router();

router.get("/themes", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const themes = await Theme.find({ conferenceId: conference._id }).sort({ displayOrder: 1 });
    return res.json({ success: true, data: themes });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.post("/themes", async (req, res) => {
  try {
    const { conference, status, message } = await resolveConference(req);
    if (!conference) return sendError(res, status, message);

    const themeData = { ...req.body, conferenceId: conference._id };
    const theme = new Theme(themeData);
    await theme.save();

    return res.status(201).json({ success: true, data: theme });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.put("/themes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid theme ID.");

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.conferenceId;

    const theme = await Theme.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!theme) return sendError(res, 404, "Theme not found.");

    return res.json({ success: true, data: theme });
  } catch (error) {
    return handleModelError(res, error);
  }
});

router.delete("/themes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid theme ID.");

    const theme = await Theme.findByIdAndDelete(id);
    if (!theme) return sendError(res, 404, "Theme not found.");

    return res.json({ success: true, message: "Theme deleted successfully." });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
