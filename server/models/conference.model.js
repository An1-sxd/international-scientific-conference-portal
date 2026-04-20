import mongoose from "mongoose";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const conferenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slogan: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        validator: (value) => !value || EMAIL_REGEX.test(value),
        message: "Contact email must be a valid email address.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "conferences",
  }
);

conferenceSchema.path("endDate").validate(function (value) {
  return !this.startDate || !value || value >= this.startDate;
}, "End date must be on or after the start date.");

conferenceSchema.index({ isActive: 1, startDate: 1 });
conferenceSchema.index({ name: 1, startDate: 1 });

const Conference = mongoose.models.Conference || mongoose.model("Conference", conferenceSchema);

export default Conference;
