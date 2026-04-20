import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "themes",
  }
);

themeSchema.index({ conferenceId: 1, code: 1 }, { unique: true });
themeSchema.index({ conferenceId: 1, displayOrder: 1 });
themeSchema.index({ conferenceId: 1, label: 1 });

const Theme = mongoose.models.Theme || mongoose.model("Theme", themeSchema);

export default Theme;
