import mongoose from "mongoose";

import { COMMITTEE_USER_ROLES } from "../constants/enums.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const committeeUserSchema = new mongoose.Schema(
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
    passwordHash: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    role: {
      type: String,
      enum: COMMITTEE_USER_ROLES,
      default: "EDITOR",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "committeeUsers",
  }
);

committeeUserSchema.index({ role: 1, isActive: 1 });

const CommitteeUser =
  mongoose.models.CommitteeUser || mongoose.model("CommitteeUser", committeeUserSchema);

export default CommitteeUser;
