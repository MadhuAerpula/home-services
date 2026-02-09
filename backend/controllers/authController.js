const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/sendToken");


// ✅ REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    const exists = await User.findOne({ email });

    if (exists)
      return res.status(400).json({
        detail: "Email already registered",
      });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash: hash,
      name,
      role,
      phone,
    });

    sendToken(user, res);

  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};


// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({
        detail: "Invalid credentials",
      });

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid)
      return res.status(401).json({
        detail: "Invalid credentials",
      });

    sendToken(user, res);

  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};


// ✅ LOGOUT
exports.logout = async (req, res) => {
  res.clearCookie("session_token");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};


// ✅ GET CURRENT USER
exports.getMe = async (req, res) => {
  res.json(req.user);
};
