// models/eventLog.model.js
const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g., "USER_CREATED", "PRODUCT_UPDATED"
    description: { type: String }, // extra info if needed
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    ipAddress: { type: String },
    metadata: { type: Object }, // flexible JSON for any custom info
    createdBy: { type: String, default: "system" }, // system / cron / userId
  },
  { timestamps: true }
);

exports.EventLog =
  mongoose.models.EventLog || mongoose.model("EventLog", eventLogSchema);
