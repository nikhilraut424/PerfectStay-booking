const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn,isAuthor } = require("../middleware.js");

const reviewController=require("../controllers/review.js")
//Reviews
// post Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
  
  // Delete Review route
  router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.destroyReview));
  module.exports=router;