const mongoose = require("mongoose");
const { UserInfoSchema } = require("./userModel");

const VALID_LABELS = ["bug", "feature", "help wanted", "enhancement"];

const BugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 100,
    },
    body: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    date_opened: {
      type: Date,
      default: Date.now,
    },
    isOpen: { type: Boolean, default: true },
    author: { type: UserInfoSchema, required: true },
    labels: {
      type: [String],
      enum: VALID_LABELS,
    },
  },
  { strict: true }
);

BugSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const Bug = mongoose.model("Bug", BugSchema);

module.exports = { Bug };
