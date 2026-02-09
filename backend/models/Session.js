const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  session_token: {
    type: String,
    required: true,
    unique: true,
    index: true, // ⚡ speeds up auth lookup
  },

  user_id: {
    type: String,
    required: true,
    index: true,
  },

  expires_at: {
    type: Date,
    required: true,
    index: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", sessionSchema);
