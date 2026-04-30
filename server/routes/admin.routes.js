import express from "express";

import authRoute from "./admin/auth.route.js";
import dashboardRoute from "./admin/dashboard.route.js";
import conferencesRoute from "./admin/conferences.route.js";
import themesRoute from "./admin/themes.route.js";
import speakersRoute from "./admin/speakers.route.js";
import sessionsRoute from "./admin/sessions.route.js";
import submissionsRoute from "./admin/submissions.route.js";
import registrationsRoute from "./admin/registrations.route.js";
import participantsRoute from "./admin/participants.route.js";
import certificatesRoute from "./admin/certificates.route.js";
import researchesRoute from "./admin/researches.route.js";

import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Auth routes (public — login/logout/me don't need full protection)
router.use(authRoute);

// Everything below requires authentication
router.use(authenticateAdmin);

router.use(dashboardRoute);
router.use(conferencesRoute);
router.use(themesRoute);
router.use(speakersRoute);
router.use(sessionsRoute);
router.use(submissionsRoute);
router.use(registrationsRoute);
router.use(participantsRoute);
router.use(certificatesRoute);
router.use(researchesRoute);

export default router;
