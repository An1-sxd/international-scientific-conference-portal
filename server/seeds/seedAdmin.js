import { pathToFileURL } from "node:url";

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Admin from "../models/admin.model.js";

dotenv.config();

/**
 * Usage:  node seeds/seedAdmin.js "Full Name" "email@example.com" "password"
 */
const seedAdmin = async () => {
  const [, , fullName, email, password] = process.argv;

  if (!fullName || !email || !password) {
    console.error("Usage: node seeds/seedAdmin.js <fullName> <email> <password>");
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    console.log(`Admin with email "${email}" already exists (ID: ${existing._id}).`);
    return;
  }

  const admin = new Admin({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: "ADMIN",
  });

  await admin.save();

  console.log("Admin created successfully:");
  console.log(`  ID:    ${admin._id}`);
  console.log(`  Name:  ${admin.fullName}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);
};

const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    await seedAdmin();
  } catch (error) {
    console.error("Seed admin failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
