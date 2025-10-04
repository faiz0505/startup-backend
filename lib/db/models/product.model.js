const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Size: M", "Color: Red"
    additionalPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String }, // optional unique identifier
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    categories: [{ type: String, required: true }],
    tags: [{ type: String }],

    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    availability: {
      type: [String],
      enum: ["online", "in-store"],
      default: ["in-store"],
    },
    stock: { type: Number, default: 0 },
    variants: [variantSchema],

    images: [{ url: String, fileId: String }],
    thumbnail: { url: String, fileId: String },

    ratings: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "inactive", "out-of-stock"],
      default: "active",
    },
    isFeatured: { type: Boolean, default: false }, // for promotions
    isArchived: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", tags: "text" });
productSchema.index({ categories: 1 });

exports.Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);