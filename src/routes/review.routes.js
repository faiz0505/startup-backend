const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controlles");

router.post("/", reviewController.createReview);
router.get("/:targetId", reviewController.getReviews);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
