import express from "express";

import dashboardRoute from "./admin/dashboard.route.js";
import speakersRoute from "./admin/speakers.route.js";
import sessionsRoute from "./admin/sessions.route.js";
import submissionsRoute from "./admin/submissions.route.js";
import registrationsRoute from "./admin/registrations.route.js";
import certificatesRoute from "./admin/certificates.route.js";

const router = express.Router();

router.use(dashboardRoute);
router.use(speakersRoute);
router.use(sessionsRoute);
router.use(submissionsRoute);
router.use(registrationsRoute);
router.use(certificatesRoute);

export default router;
