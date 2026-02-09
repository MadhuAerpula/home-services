require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/Service"); // adjust if name differs

const services = [
  {
    category_id: "service_elec001",
    name: "Electrician",
    description: "Professional electrical repairs and installations.",
    price_range: "$50 - $150",
    estimated_time: "1-2 hours",
    icon: "⚡",
    active: true,
  },
  {
    category_id: "service_plumb001",
    name: "Plumber",
    description: "Expert plumbing services.",
    price_range: "$60 - $200",
    estimated_time: "1-3 hours",
    icon: "🔧",
    active: true,
  },
  {
    category_id: "service_ac001",
    name: "AC Repair",
    description: "Complete AC maintenance.",
    price_range: "$80 - $300",
    estimated_time: "1-2 hours",
    icon: "❄️",
    active: true,
  },

  {
    category_id: "service_wash001",
    name: "Washing Machine Repair",
    description: "Fix drainage, motor, and washing issues.",
    price_range: "$50 - $180",
    estimated_time: "1-2 hours",
    icon: "🧺",
    active: true,
  },
  {
    category_id: "service_fridge001",
    name: "Refrigerator Repair",
    description: "Cooling issues and compressor repair.",
    price_range: "$60 - $250",
    estimated_time: "1-3 hours",
    icon: "🧊",
    active: true,
  },

  {
    category_id: "service_ro001",
    name: "RO Repair",
    description: "Water purifier filter replacement and repair.",
    price_range: "$30 - $120",
    estimated_time: "30-60 mins",
    icon: "💧",
    active: true,
  },

  {
    category_id: "service_micro001",
    name: "Microwave Repair",
    description: "Heating and panel repair.",
    price_range: "$40 - $150",
    estimated_time: "1 hour",
    icon: "🍳",
    active: true,
  },

  {
    category_id: "service_geyser001",
    name: "Geyser Repair",
    description: "Thermostat and heating element repair.",
    price_range: "$50 - $180",
    estimated_time: "1-2 hours",
    icon: "🔥",
    active: true,
  },

  {
    category_id: "service_chimney001",
    name: "Chimney Repair",
    description: "Kitchen chimney deep cleaning and repair.",
    price_range: "$40 - $160",
    estimated_time: "1-2 hours",
    icon: "🍳",
    active: true,
  },

  {
    category_id: "service_mobile001",
    name: "Mobile Repair",
    description: "Screen, battery and software fixes.",
    price_range: "$30 - $200",
    estimated_time: "30 mins - 2 hours",
    icon: "📱",
    active: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const count = await Service.countDocuments();

    if (count === 0) {
      await Service.insertMany(services);
      console.log("✅ Services inserted!");
    } else {
      console.log("⚠️ Services already exist.");
    }

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedDB();
