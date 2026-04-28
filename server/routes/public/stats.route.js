import express from "express";

import Conference from "../../models/conference.model.js";
import Speaker from "../../models/speaker.model.js";
import Theme from "../../models/theme.model.js";
import { handleModelError } from "./helpers.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [totalConferences, totalSpeakers, totalThemes, countriesAgg] = await Promise.all([
      Conference.countDocuments(),
      Speaker.countDocuments(),
      Theme.countDocuments(),
      Speaker.distinct("country"),
    ]);

    const totalCountries = countriesAgg.filter(Boolean).length;

    return res.json({
      success: true,
      data: {
        totalConferences,
        totalSpeakers,
        totalThemes,
        totalCountries,
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

export default router;
