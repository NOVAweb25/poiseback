const express = require("express");
const router = express.Router();
const unavailableDateController = require("../controllers/unavailableDateController");

router.post("/", unavailableDateController.createUnavailableDate);
router.get("/", unavailableDateController.getUnavailableDates);
router.get("/:id", unavailableDateController.getUnavailableDateById);
router.put("/:id", unavailableDateController.updateUnavailableDate);
router.delete("/:id", unavailableDateController.deleteUnavailableDate);

module.exports = router;
