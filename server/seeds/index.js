import { pathToFileURL } from "node:url";

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Certificate from "../models/certificate.model.js";
import Conference from "../models/conference.model.js";
import Participant from "../models/participant.model.js";
import Registration from "../models/registration.model.js";
import Session from "../models/session.model.js";
import Speaker from "../models/speaker.model.js";
import Submission from "../models/submission.model.js";
import Theme from "../models/theme.model.js";
import { conferenceSeeds } from "./data.js";

dotenv.config();

const syncDocument = async (Model, filter, data) => {
  const existingDocument = await Model.findOne(filter);

  if (existingDocument) {
    Object.assign(existingDocument, data);
    return existingDocument.save();
  }

  return Model.create(data);
};

export const seedDatabase = async () => {
  await connectDB();

  const totals = {
    conferences: 0,
    themes: 0,
    speakers: 0,
    sessions: 0,
    participants: 0,
    registrations: 0,
    submissions: 0,
    certificates: 0,
  };

  for (const conferenceSeedBundle of conferenceSeeds) {
    const {
      conference: conferenceSeed,
      themeSeeds,
      speakerSeeds,
      sessionSeeds,
      participantSeeds,
      registrationSeeds,
      submissionSeeds,
      certificateSeeds,
    } = conferenceSeedBundle;

    const conference = await syncDocument(
      Conference,
      { contactEmail: conferenceSeed.contactEmail },
      conferenceSeed,
    );

    totals.conferences += 1;

    const themesByKey = new Map();
    for (const themeSeed of themeSeeds) {
      const { key, ...themeData } = themeSeed;
      const theme = await syncDocument(
        Theme,
        { conferenceId: conference._id, code: themeData.code },
        { conferenceId: conference._id, ...themeData },
      );
      themesByKey.set(key, theme);
      totals.themes += 1;
    }

    const speakersByKey = new Map();
    for (const speakerSeed of speakerSeeds) {
      const { key, ...speakerData } = speakerSeed;
      const speaker = await syncDocument(
        Speaker,
        { conferenceId: conference._id, email: speakerData.email },
        { conferenceId: conference._id, ...speakerData },
      );
      speakersByKey.set(key, speaker);
      totals.speakers += 1;
    }

    const participantsByEmail = new Map();
    for (const participantSeed of participantSeeds) {
      const participant = await syncDocument(
        Participant,
        { email: participantSeed.email },
        participantSeed,
      );
      participantsByEmail.set(participant.email, participant);
      totals.participants += 1;
    }

    const registrationsByParticipantEmail = new Map();
    for (const registrationSeed of registrationSeeds) {
      const participant = participantsByEmail.get(
        registrationSeed.participantEmail,
      );

      if (!participant) {
        throw new Error(
          `Missing participant for registration "${registrationSeed.participantEmail}".`,
        );
      }

      const registration = await syncDocument(
        Registration,
        { conferenceId: conference._id, participantId: participant._id },
        {
          conferenceId: conference._id,
          participantId: participant._id,
          registrationStatus: registrationSeed.registrationStatus,
          attendanceConfirmed: registrationSeed.attendanceConfirmed,
          notes: registrationSeed.notes,
          registeredAt: registrationSeed.registeredAt,
        },
      );

      registrationsByParticipantEmail.set(
        registrationSeed.participantEmail,
        registration,
      );
      totals.registrations += 1;
    }

    for (const sessionSeed of sessionSeeds) {
      const theme = themesByKey.get(sessionSeed.themeKey);
      const speaker = sessionSeed.speakerKey
        ? speakersByKey.get(sessionSeed.speakerKey)
        : null;

      if (!theme) {
        throw new Error(
          `Missing theme for session "${sessionSeed.sessionTitle}".`,
        );
      }

      await syncDocument(
        Session,
        {
          conferenceId: conference._id,
          sessionTitle: sessionSeed.sessionTitle,
          startsAt: sessionSeed.startsAt,
        },
        {
          conferenceId: conference._id,
          themeId: theme._id,
          speakerId: speaker?._id || null,
          sessionTitle: sessionSeed.sessionTitle,
          startsAt: sessionSeed.startsAt,
          endsAt: sessionSeed.endsAt,
          room: sessionSeed.room,
          description: sessionSeed.description,
        },
      );

      totals.sessions += 1;
    }

    for (const submissionSeed of submissionSeeds) {
      const theme = themesByKey.get(submissionSeed.themeKey);

      if (!theme) {
        throw new Error(
          `Missing theme for submission "${submissionSeed.paperTitle}".`,
        );
      }

      await syncDocument(
        Submission,
        { conferenceId: conference._id, paperTitle: submissionSeed.paperTitle },
        {
          conferenceId: conference._id,
          themeId: theme._id,
          paperTitle: submissionSeed.paperTitle,
          abstract: submissionSeed.abstract,
          institution: submissionSeed.institution,
          country: submissionSeed.country,
          status: submissionSeed.status,
          reviewComment: submissionSeed.reviewComment,
          pdfUrl: submissionSeed.pdfUrl,
          submittedAt: submissionSeed.submittedAt,
          authors: submissionSeed.authors,
        },
      );

      totals.submissions += 1;
    }

    for (const certificateSeed of certificateSeeds) {
      const participant = participantsByEmail.get(
        certificateSeed.participantEmail,
      );
      const registration = registrationsByParticipantEmail.get(
        certificateSeed.participantEmail,
      );

      if (!participant || !registration) {
        throw new Error(
          `Missing participant or registration for certificate "${certificateSeed.participantEmail}".`,
        );
      }

      await syncDocument(
        Certificate,
        { registrationIdRef: registration._id },
        {
          conferenceId: conference._id,
          registrationIdRef: registration._id,
          participantId: participant._id,
          certificateType: certificateSeed.certificateType,
          ownerName: participant.fullName,
          ownerEmail: participant.email,
          issueDate: certificateSeed.issueDate,
          status: certificateSeed.status,
          pdfUrl: certificateSeed.pdfUrl,
        },
      );

      totals.certificates += 1;
    }
  }

  console.log("Seed completed successfully.");
  console.log(`Conferences: ${totals.conferences}`);
  console.log(`Themes: ${totals.themes}`);
  console.log(`Speakers: ${totals.speakers}`);
  console.log(`Sessions: ${totals.sessions}`);
  console.log(`Participants: ${totals.participants}`);
  console.log(`Registrations: ${totals.registrations}`);
  console.log(`Submissions: ${totals.submissions}`);
  console.log(`Certificates: ${totals.certificates}`);
};

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
