const Review = require("../models/Review");
const { v4: uuidv4 } = require("uuid");

exports.createReview = async (req, res) => {
  const review = await Review.create({
    review_id: "review_" + uuidv4(),
    customer_id: req.user.user_id,
    ...req.body,
  });

  res.json(review);
};
