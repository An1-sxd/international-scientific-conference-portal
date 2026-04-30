import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { COMMITTEE_USER_ROLES } from "../constants/enums.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: COMMITTEE_USER_ROLES,
      default: "ADMIN",
    },
  },
  {
    timestamps: true,
    collection: "admins",
  }
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords
adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
