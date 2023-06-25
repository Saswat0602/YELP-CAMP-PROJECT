const express = require("express");
const router = express.Router({ mergeParams: true });
//ISLOGGEDIN CHECK THE USER IS LOGGED IN OR NOT IF USER IS NOT LOGGEDIN REDDIRECT IT TO LOGIN PAGE
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");


router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
