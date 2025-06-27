const express = require('express');
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require('../models/listing');
const Review = require('../models/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewController = require("../controllers/review");


//Reviews
//Post Review Route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review Route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;