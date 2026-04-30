import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Submission from "../models/submission.model.js";

dotenv.config();

const removeSubmissionsWithoutPdf = async () => {
  await connectDB();

  const filter = {
    $or: [
      { pdfUrl: { $exists: false } },
      { pdfUrl: null },
      { pdfUrl: "" },
      { pdfUrl: { $regex: "^\\s*$" } },
    ],
  };

  const result = await Submission.deleteMany(filter);
  console.log(
    `Removed ${result.deletedCount || 0} submissions with no pdfUrl.`,
  );
};

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    await removeSubmissionsWithoutPdf();
  } catch (error) {
    console.error("Error removing submissions:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
