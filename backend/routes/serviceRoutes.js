const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const ctrl = require("../controllers/serviceController");

router.get("/", ctrl.getServices);
router.get("/:category_id", ctrl.getServiceByCategoryId);
router.post("/", auth, admin, ctrl.createService);

module.exports = router;
