const express = require("express");
const router = express.Router();
const timeController = require("../controllers/timeController");

router.post("/", timeController.createTimeSlot);
router.get("/", timeController.getTimeSlots);
router.get("/:id", timeController.getTimeSlotById);
router.put("/:id", timeController.updateTimeSlot);
router.delete("/:id", timeController.deleteTimeSlot);

module.exports = router;
