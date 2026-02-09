const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    category_id: {
      type: String,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: String,
    price_range: String,
    estimated_time: String,
    icon: String,

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "service_categories", // 🔑 CRITICAL
  }
);

module.exports = mongoose.model("Service", serviceSchema);

