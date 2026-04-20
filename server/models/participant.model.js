import mongoose from "mongoose";

import { PARTICIPANT_TYPES } from "../constants/enums.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const participantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: "Email must be a valid email address.",
      },
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    affiliation: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    participantType: {
      type: String,
      enum: PARTICIPANT_TYPES,
      default: "RESEARCHER",
    },
  },
  {
    timestamps: true,
    collection: "participants",
  }
);

participantSchema.index({ fullName: 1 });
participantSchema.index({ participantType: 1 });

const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema);

export default Participant;
