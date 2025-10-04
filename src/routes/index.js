const express = require("express");
const userRoutes = require("./user.routes");
const shopRoutes = require("./shop.routes");
const reviewRoutes = require("./review.routes");
const productRoutes = require("./product.routes");
const mediaRoute = require("./media.route");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/reviewes", reviewRoutes);
router.use("/products", productRoutes);
router.use("/media", mediaRoute);

module.exports = router;
