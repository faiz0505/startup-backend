const mongoose = require("mongoose");
const { User } = require("./user.model");

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    categories: [{ type: String, required: true }],
    tags: [{ type: String }],
    address: {
      fullAddress: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      geoLocation: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
    },
    logo: { url: String, fileId: String },
    images: [{ url: String, fileId: String }],
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    isTrending: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    operationalHours: [
      {
        day: {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        open: { type: String }, // HH:mm format
        close: { type: String },
      },
    ],
    ratings: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
shopSchema.index({ "address.geoLocation": "2dsphere" });

/**
 * Post-save hook → link shop to user
 */
shopSchema.post("save", async function (doc, next) {
  try {
    // Non-blocking update (fire & forget)
    process.nextTick(async () => {
      await User.findByIdAndUpdate(doc.owner, {
        shopId: doc._id,
        role: "shopkeeper",
      });
    });
    next();
  } catch (err) {
    console.error("Error linking shop to user:", err);
    next(err);
  }
});

/**
 * Post-update hook → unlink shop if archived
 */
shopSchema.post("findOneAndUpdate", async function (doc, next) {
  try {
    if (!doc) return next();

    // if shop archived → reset user
    if (doc.isArchived) {
      process.nextTick(async () => {
        await User.findByIdAndUpdate(doc.owner, {
          $set: { shopId: null, role: "customer" },
        });
      });
    }
    next();
  } catch (err) {
    console.error("Error unlinking shop from user:", err);
    next(err);
  }
});

exports.Shop = mongoose.models.Shop || mongoose.model("Shop", shopSchema);
