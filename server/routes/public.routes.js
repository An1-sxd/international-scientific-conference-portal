import express from "express";

import agendaCurrentRoute from "./public/agendaCurrent.route.js";
import agendaRoute from "./public/agenda.route.js";
import certificateCheckRoute from "./public/certificateCheck.route.js";
import conferenceActiveRoute from "./public/conferenceActive.route.js";
import conferencesRoute from "./public/conferences.route.js";
import statsRoute from "./public/stats.route.js";
import speakerByIdRoute from "./public/speakerById.route.js";
import speakersRoute from "./public/speakers.route.js";
import registerRoute from "./public/register.route.js";
import registrationTrackRoute from "./public/registrationTrack.route.js";
import submissionStatusRoute from "./public/submissionStatus.route.js";
import submitPaperRoute from "./public/submitPaper.route.js";
import themesRoute from "./public/themes.route.js";

const router = express.Router();

router.use(conferenceActiveRoute);
router.use(conferencesRoute);
router.use(statsRoute);
router.use(themesRoute);
router.use(speakersRoute);
router.use(speakerByIdRoute);
router.use(agendaRoute);
router.use(agendaCurrentRoute);
router.use(submitPaperRoute);
router.use(submissionStatusRoute);
router.use(registerRoute);
router.use(registrationTrackRoute);
router.use(certificateCheckRoute);

export default router;
