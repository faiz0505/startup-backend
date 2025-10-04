const { Shop } = require("../../lib/db/models/shop.model");
const { logEvent } = require("../../utils/logger");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../../utils/response");

exports.createShop = async (req, res) => {
  try {
    const shop = new Shop({ ...req.body});
    await shop.save();

    // fire-and-forget event log (non-blocking)
    logEvent({
      action: "SHOP_CREATED",
      description: `Shop "${shop.name}" created`,
      user: req.user ? req.user._id : null,
      shop: shop._id,
      ipAddress: req.ip,
      metadata: req.body,
      createdBy: req.user ? req.user._id : "system",
    });

    return successResponse(res, shop, "Shop created successfully", 201);
  } catch (error) {
    console.log(error);
    
    return errorResponse(res, error.message, 400);
  }
};

// GET single shop
exports.getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate(
      "owner",
      "name email"
    );
    if (!shop) return notFoundResponse(res, "Shop not found");
    return successResponse(res, shop);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// GET all shops with optional filters
exports.getShops = async (req, res) => {
  try {
    const filters = { isArchived: false };
    if (req.query.category) filters.categories = req.query.category;
    if (req.query.city) filters["address.city"] = req.query.city;

    const shops = await Shop.find(filters);
    return successResponse(res, shops);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// UPDATE shop
exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!shop) return notFoundResponse(res, "Shop not found");
    return successResponse(res, shop, "Shop updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE (archive) shop
exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isArchived: true },
      { new: true }
    );

    if (!shop) return notFoundResponse(res, "Shop not found");

    // fire-and-forget log event
    logEvent({
      action: "SHOP_ARCHIVED",
      description: `Shop "${shop.name}" archived`,
      user: req.user ? req.user._id : null,
      shop: shop._id,
      ipAddress: req.ip,
      createdBy: req.user ? req.user._id : "system",
    });

    return successResponse(res, null, "Shop archived successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
