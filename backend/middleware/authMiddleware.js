const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.session_token;

    if (!token)
      return res.status(401).json({
        detail: "Not authenticated",
      });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password_hash");

    if (!user)
      return res.status(404).json({
        detail: "User not found",
      });

    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({
      detail: "Invalid token",
    });
  }
};
