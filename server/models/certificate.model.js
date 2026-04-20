import mongoose from "mongoose";

import { CERTIFICATE_STATUSES } from "../constants/enums.js";
import { createVerificationCode, formatPublicId, getNextSequence } from "../utils/publicId.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const certificateSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
      index: true,
    },
    registrationIdRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      unique: true,
      index: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
      index: true,
    },
    certificateId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    certificateType: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      default: "PARTICIPANT",
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: "Owner email must be a valid email address.",
      },
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    verificationCode: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: CERTIFICATE_STATUSES,
      default: "GENERATED",
      index: true,
    },
    pdfUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    collection: "certificates",
  }
);

certificateSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && !this.certificateId) {
      const sequence = await getNextSequence("certificate");
      this.certificateId = formatPublicId("CERT", sequence, this.issueDate || new Date());
    }

    if (this.isNew && !this.verificationCode) {
      this.verificationCode = createVerificationCode();
    }

    next();
  } catch (error) {
    next(error);
  }
});

certificateSchema.index({ conferenceId: 1, status: 1, issueDate: -1 });
certificateSchema.index({ participantId: 1, status: 1 });
certificateSchema.index({ ownerEmail: 1 });

const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

export default Certificate;
