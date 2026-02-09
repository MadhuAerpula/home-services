const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/bookingController");

router.post("/", auth, ctrl.createBooking);
router.get("/", auth, ctrl.getBookings);

module.exports = router;
