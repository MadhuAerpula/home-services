const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review_id: {
    type: String,
    unique: true,
    index: true,
  },

  booking_id: {
    type: String,
    required: true,
    index: true,
  },

  customer_id: String,
  customer_name: String,

  professional_id: {
    type: String,
    index: true,
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  comment: String,

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
