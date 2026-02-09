const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  service_categories: [
    {
      type: String,
    },
  ],

  availability: {
    type: Object,
    default: {},
  },

  verified: {
    type: Boolean,
    default: false,
  },

  rating: {
    type: Number,
    default: 0,
  },

  total_reviews: {
    type: Number,
    default: 0,
  },

  earnings_total: {
    type: Number,
    default: 0,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Professional", professionalSchema);
