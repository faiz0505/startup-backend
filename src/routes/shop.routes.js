const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop.controller");

router.post("/", shopController.createShop);
router.get("/", shopController.getShops);
router.get("/:id", shopController.getShop);
router.put("/:id", shopController.updateShop);
router.delete("/:id", shopController.deleteShop);

module.exports = router;
