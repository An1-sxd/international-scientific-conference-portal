import mongoose from "mongoose";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const speakerSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    academicTitle: {
      type: String,
      trim: true,
      maxlength: 80,
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
    topic: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    biography: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    photoUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    photoPublicId: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        validator: (value) => !value || EMAIL_REGEX.test(value),
        message: "Email must be a valid email address.",
      },
    },
  },
  {
    timestamps: true,
    collection: "speakers",
  }
);

speakerSchema.index({ conferenceId: 1, fullName: 1 });
speakerSchema.index({ conferenceId: 1, topic: 1 });
speakerSchema.index({ email: 1 }, { sparse: true });

const Speaker = mongoose.models.Speaker || mongoose.model("Speaker", speakerSchema);

export default Speaker;
