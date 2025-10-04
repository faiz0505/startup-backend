const mongoose = require("mongoose");
const updateTargetRatings = require("../../../utils/reviewAggregator");

const reviewSchema = new mongoose.Schema(
  {
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      required: true,
      enum: ["Shop", "Product"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String },
    likes: { type: Number, default: 0 },
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["visible", "hidden", "reported"],
      default: "visible",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ target: 1, user: 1 }, { unique: true });
reviewSchema.index({ target: 1, createdAt: -1 });

// AFTER creating a review
reviewSchema.post("save", async function () {
  await updateTargetRatings(this.target, this.targetModel);
});

// AFTER updating a review
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) await updateTargetRatings(doc.target, doc.targetModel);
});

// AFTER deleting a review
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await updateTargetRatings(doc.target, doc.targetModel);
});
exports.Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);