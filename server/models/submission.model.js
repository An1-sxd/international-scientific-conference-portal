import mongoose from "mongoose";

import { SUBMISSION_STATUSES } from "../constants/enums.js";
import { formatPublicId, getNextSequence } from "../utils/publicId.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authorSchema = new mongoose.Schema(
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
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: "Author email must be a valid email address.",
      },
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
    authorOrder: {
      type: Number,
      required: true,
      min: 1,
    },
    isCorresponding: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const hasValidAuthors = (authors) => {
  if (!Array.isArray(authors) || authors.length === 0) {
    return false;
  }

  const correspondingCount = authors.filter((author) => author.isCorresponding).length;
  const orderSet = new Set(authors.map((author) => author.authorOrder));

  return correspondingCount === 1 && orderSet.size === authors.length;
};

const submissionSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
      index: true,
    },
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
      required: true,
      index: true,
    },
    submissionId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    paperTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    abstract: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    institution: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: "PENDING",
      index: true,
    },
    reviewComment: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    pdfUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    authors: {
      type: [authorSchema],
      required: true,
      validate: {
        validator: hasValidAuthors,
        message:
          "A submission must have at least one author, exactly one corresponding author, and unique authorOrder values.",
      },
    },
  },
  {
    timestamps: true,
    collection: "submissions",
  }
);

submissionSchema.pre("validate", async function (next) {
  try {
    if (Array.isArray(this.authors)) {
      this.authors.forEach((author, index) => {
        if (!author.authorOrder) {
          author.authorOrder = index + 1;
        }
      });
    }

    if (this.isNew && !this.submissionId) {
      const sequence = await getNextSequence("submission");
      this.submissionId = formatPublicId("SUB", sequence, this.submittedAt || new Date());
    }

    next();
  } catch (error) {
    next(error);
  }
});

submissionSchema.index({ conferenceId: 1, themeId: 1, submittedAt: -1 });
submissionSchema.index({ "authors.email": 1 });
submissionSchema.index({ paperTitle: "text", abstract: "text" });

const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

export default Submission;
