const { Product } = require("../../lib/db/models/product.model");
const { logEvent } = require("../../utils/logger");
const { successResponse, errorResponse, notFoundResponse } = require("../../utils/response");

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // fire-and-forget event log (non-blocking)
    logEvent({
      action: "PRODUCT_CREATED",
      description: `Product "${product.name}" created`,
      user: req.user ? req.user._id : null, // if auth middleware attaches user
      shop: product.shop,
      product: product._id,
      ipAddress: req.ip,
      metadata: req.body,
      createdBy: req.user ? req.user._id : "system",
    });

    return successResponse(res, product, "Product created successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, 400, err.errors);
  }
};

// ✅ Get All Products (with filters, pagination, search)
exports.getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.categories = category;
    }
    if (status) {
      filter.status = status;
    }

    const products = await Product.find(filter)
      .populate("owner", "fullName email")
      .populate("shop", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(filter);

    return successResponse(res, { products, total: count }, "Products fetched");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ✅ Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("owner", "fullName email")
      .populate("shop", "name");

    if (!product) return notFoundResponse(res, "Product not found");

    return successResponse(res, product, "Product fetched");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ✅ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) return notFoundResponse(res, "Product not found");

    return successResponse(res, product, "Product updated successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return notFoundResponse(res, "Product not found");

    return successResponse(res, product, "Product deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


// ✅ Get all products of a shop (for shopkeeper/admin)
exports.getShopProductsForAdmin = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { shop: shopId };
    if (status) filter.status = status; // optional status filter

    const products = await Product.find(filter)
      .populate("owner", "fullName email")
      .populate("shop", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(filter);

    return successResponse(res, { products, total: count }, "Shop products fetched (admin)");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
// ✅ Get public products of a shop (for shop page on website)
exports.getShopProductsForPublic = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10, category, search } = req.query;

    const filter = {
      shop: shopId,
      status: "active",     // only active
      isArchived: false,    // not archived
    };

    if (category) filter.categories = category;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter)
      .populate("shop", "name logo")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(filter);

    return successResponse(res, { products, total: count }, "Shop products fetched (public)");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
