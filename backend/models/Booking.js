//const mongoose = require("mongoose");

// const bookingSchema = new mongoose.Schema({
//   booking_id: String,
//   customer_id: String,
//   professional_id: String,
//   service_category_id: String,
//   service_name: String,
//   address: String,
//   scheduled_date: String,
//   scheduled_time: String,
//   status: String,
//   created_at: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Booking", bookingSchema);


const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  booking_id: {
    type: String,
    unique: true,
    index: true,
  },

  customer_id: {
    type: String,
    index: true,
  },

  customer_name: String,
  customer_phone: String,

  professional_id: {
    type: String,
    index: true,
  },

  professional_name: String,

  service_category_id: String,
  service_name: String,

  address: String,

  scheduled_date: String,
  scheduled_time: String,

  status: {
    type: String,
    enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
    default: "pending",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
