// const router = require("express").Router();
// const {
//   register,
//   login,
// } = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");

// router.get("/me", authMiddleware, (req, res) => {
//   res.json(req.user);
// });

// router.post("/register", register);
// router.post("/login", login);

// module.exports = router;

const router = require("express").Router();

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);

module.exports = router;



// const router = require("express").Router();
// const ctrl = require("../controllers/authController");

// router.post("/register", ctrl.register);
// router.post("/login", ctrl.login);

// module.exports = router;
