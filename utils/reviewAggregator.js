// utils/reviewAggregator.js
const mongoose = require("mongoose");

async function updateTargetRatings(targetId, targetModel) {
  const Review = mongoose.model("Review");
  const Target = mongoose.model(targetModel); // Shop or Product

  // Aggregate average rating and review count
  const result = await Review.aggregate([
    { $match: { target: targetId, targetModel, status: "visible" } },
    {
      $group: {
        _id: "$target",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const update = result[0]
    ? { ratings: result[0].avgRating, reviewCount: result[0].reviewCount }
    : { ratings: 0, reviewCount: 0 };

  await Target.findByIdAndUpdate(targetId, update);
}

module.exports = updateTargetRatings;
