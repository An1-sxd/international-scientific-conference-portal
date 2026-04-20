import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
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
    speakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Speaker",
      default: null,
      index: true,
    },
    sessionTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    room: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
  },
  {
    timestamps: true,
    collection: "sessions",
  }
);

sessionSchema.path("endsAt").validate(function (value) {
  return !this.startsAt || !value || value > this.startsAt;
}, "Session end time must be after the start time.");

sessionSchema.index({ conferenceId: 1, startsAt: 1, endsAt: 1 });
sessionSchema.index({ conferenceId: 1, themeId: 1, startsAt: 1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
