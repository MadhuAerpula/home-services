const sendToken = (user, res) => {
  const jwt = require("jsonwebtoken");

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  res.cookie("session_token", token, {
    httpOnly: true,
    secure: false, // change to true in production
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  // NEVER send password
  const safeUser = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
  };

  res.json({
    success: true,
    user: safeUser,
  });
};

module.exports = sendToken;
