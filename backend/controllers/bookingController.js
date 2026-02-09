const Booking = require("../models/Booking");
const ServiceCategory = require("../models/Service");
const { v4: uuidv4 } = require("uuid");

exports.createBooking = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        detail: "Only customers can create bookings",
      });
    }

    const { service_category_id, address, scheduled_date, scheduled_time } =
      req.body;

    // 1️⃣ Validate service
    const service = await ServiceCategory.findOne({
      category_id: service_category_id,
      active: true,
    });

    if (!service) {
      return res.status(404).json({
        detail: "Service not found",
      });
    }

    // 2️⃣ Create booking
    const booking = await Booking.create({
      booking_id: "booking_" + uuidv4().slice(0, 12),

      customer_id: req.user.user_id,
      customer_name: req.user.name,
      customer_phone: req.user.phone || null,

      professional_id: null,
      professional_name: null,

      service_category_id,
      service_name: service.name,

      address,
      scheduled_date,
      scheduled_time,

      status: "pending",
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};


exports.getBookings = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "customer") {
      query.customer_id = req.user.user_id;
    } else if (req.user.role === "professional") {
      query.professional_id = req.user.user_id;
    }

    const bookings = await Booking.find(query).sort({
      created_at: -1,
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};

