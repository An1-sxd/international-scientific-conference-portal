import mongoose from "mongoose";

import { REGISTRATION_STATUSES } from "../constants/enums.js";
import { formatPublicId, getNextSequence } from "../utils/publicId.js";

const registrationSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
      index: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
      index: true,
    },
    registrationId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    registrationStatus: {
      type: String,
      enum: REGISTRATION_STATUSES,
      default: "REGISTERED",
      index: true,
    },
    attendanceConfirmed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "registrations",
  }
);

registrationSchema.pre("validate", async function () {
  if (this.isNew && !this.registrationId) {
    const sequence = await getNextSequence("registration");
    this.registrationId = formatPublicId("REG", sequence, this.registeredAt || new Date());
  }
});

registrationSchema.index({ conferenceId: 1, participantId: 1 }, { unique: true });
registrationSchema.index({ conferenceId: 1, registrationStatus: 1, registeredAt: -1 });

const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);

export default Registration;
