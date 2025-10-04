const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controllers");

// CRUD Routes
router.post("/", productController.createProduct);
router.get("/", productController.getProducts);
router.get("/shops/:shopId/products/admin", productController.getShopProductsForAdmin);
router.get("/shops/:shopId/products", productController.getShopProductsForPublic);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
