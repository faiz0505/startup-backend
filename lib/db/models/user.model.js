const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "trialing", "canceled"],
      default: "inactive",
    },
    startDate: Date,
    endDate: Date,
    renewalDate: Date,
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    language: { type: String, default: "en" },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    profilePic: { type: String, required: false },
    phone: { type: String, sparse: true },
    role: {
      type: String,
      enum: ["customer", "shopkeeper"],
      default: null,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    subscription: { type: subscriptionSchema, default: () => ({}) },
    billingHistory: [
      {
        transactionId: String,
        amount: Number,
        currency: { type: String, default: "INR" },
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ["success", "failed", "pending"] },
      },
    ],
    preferences: { type: preferencesSchema, default: () => ({}) },
    isVerified: { type: Boolean, default: false },
    lastLogin: Date,
     pushSubscriptions: {
      type: [Object], // stores the subscription JSON from browser
      default: [],
    },
  },
  { timestamps: true }
);
exports.User = mongoose.models.User || mongoose.model("User", userSchema);
