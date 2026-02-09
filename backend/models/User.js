const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password_hash: {
      type: String,
      required: true,
    },

    name: String,
    role: {
      type: String,
      enum: ["customer", "professional", "admin"],
      default: "customer",
    },

    phone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
