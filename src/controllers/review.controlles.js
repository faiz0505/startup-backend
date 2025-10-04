const { Review } = require("../../lib/db/models/review.model");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../../utils/response");

// CREATE review
exports.createReview = async (req, res) => {
  try {
    const review = new Review({ ...req.body});
    await review.save();
    return successResponse(res, review, "Review created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// GET reviews for a target (shop/product)
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ target: req.params.targetId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return successResponse(res, reviews);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// UPDATE review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) return notFoundResponse(res, "Review not found");
    return successResponse(res, review, "Review updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!review) return notFoundResponse(res, "Review not found");
    return successResponse(res, null, "Review deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
