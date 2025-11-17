const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/:id", bookingController.getBookingById);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);

// Reschedule requests
router.post("/:id/reschedule", bookingController.requestReschedule);
router.put("/:id/reschedule/respond", bookingController.respondReschedule);

module.exports = router;
