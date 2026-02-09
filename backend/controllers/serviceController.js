const Service = require("../models/Service");
const { v4: uuidv4 } = require("uuid");

exports.getServices = async (req, res) => {
  const services = await Service.find({ active: true });
  res.json(services);
};

exports.createService = async (req, res) => {
  const service = await Service.create({
    category_id: "service_" + uuidv4().replace(/-/g, "").slice(0, 8),
    ...req.body,
    active: true,
  });

  res.json(service);
};

exports.getServiceByCategoryId = async (req, res) => {
  try {
    const { category_id } = req.params;

    const service = await Service.findOne({
      category_id,
      active: true,
    });

    if (!service) {
      return res.status(404).json({
        detail: "Service not found",
      });
    }

    res.json(service);
  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};

