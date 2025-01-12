if(process.env.NODE_ENV !="production"){
  require("dotenv").config();

}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema,reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
const listingRouter=require("./routes/listing.js");
// const review = require("./models/review.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


// function call
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// to connnct database with nodejs
async function main() {
  await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{  
    secret:process.env.SECRET,

  },
  touchAfter:24*3600,
});

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
}
store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
});


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser",async(req,res)=>{
// let fakeuser=new User({
//   email:"abc424@gmai.com",
//   username:"delta1",
// });
// let register=await User.register(fakeuser,"hello");
// res.send(register);

// })


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

app.use("/",userRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);

// Validate schema
// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };

// Validate review
// const validateReview = (req, res, next) => {
//   let { error } = reviewSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };

// // Index Route
// app.get("/listings", async (req, res) => {
//   let allListings = await Listing.find({});
//   res.render("./listing/index.ejs", { allListings });
// });

// // New Route
// app.get("/listings/new", (req, res) => {
//   res.render("listing/new.ejs");
// });

// // show route
// app.get(
//   "/listings/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listing/show.ejs", { listing });
//   })
// );

// // create Route
// app.post(
//   "/listings",
//   validateListing,
//   wrapAsync(async (req, res, next) => {
//     if (!req.body.listing) {
//       throw new ExpressError(400, "Send valid data for listing");
//     }
//     let newlisting = new Listing(req.body.listing);
//     //  validation for schema
//     // if(!newlisting.title){
//     //   throw new ExpressError(400,"Title is missing!");
//     // }
//     // if(!newlisting.description){
//     //   throw new ExpressError(400,"Description is missing!");
//     // }
//     // if(!newlisting.price){
//     //   throw new ExpressError(400,"Price is missing!");
//     // }
//     // if(!newlisting.location){
//     //   throw new ExpressError(400,"Location is missing!");
//     // }
//     // if(!newlisting.country){
//     //   throw new ExpressError(400,"Country is missing!");
//     // }

//     await newlisting.save();
//     res.redirect("/listings");
//   })
// );

// // edit update
// app.get(
//   "/listings/:id/edit",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listing/edit.ejs", { listing });
//   })
// );
// // update
// app.put(
//   "/listings/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect("/listings");
//   })
// );
// // delete
// app.delete(
//   "/listings/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const deletelist = await Listing.findByIdAndDelete(id);
//     console.log(deletelist);
//     res.redirect("/listings");
//   })
// );

// //Reviews
// // post Route
// app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req, res) => {
//   let listing = await Listing.findById(req.params.id);
//   let newReview = new Review(req.body.review);
//   listing.reviews.push(newReview);
//   await newReview.save();
//   await listing.save();
//   console.log("New review saved");
//   res.redirect(`/listings/${listing._id}`);
// }));

// // Delete ReviewId
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
// let{id, reviewId}=req.params;
// await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//array madhun delete database
// await Review.findByIdAndDelete(reviewId);
// res.redirect(`/listings/${id}`);

// }));

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);

  res.status(statusCode).render("error.ejs", { message });
});
app.listen(8080, () => {
  console.log("server is listening to 8080");
});
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// middleware
// app.use((err,req,res,next)=>{
//   res.send("something is wrong");
//   });

// app.get("/img",async(req,res)=>{
// let list=new Listing({
//     title:"hotel",
//     description:"osm",
//     price:1000,
//     location:"wojk",
//     country:"india",

// });
// await list.save()
// .then((res)=>{
//     console.log("chat was save");
// })
// .catch((err)=>{
//     console.log(err);
// })

//     res.send("root working");
// });
