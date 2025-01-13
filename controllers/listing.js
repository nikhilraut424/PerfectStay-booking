const Listing = require("../models/listing.js");




module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listing/index.ejs",{allListings});
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner").populate("category");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    res.redirect("/listings");
  }
  res.render("listing/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }
;
  let url=req.file.path;
  let filename=req.file.filename;
  let newlisting = new Listing(req.body.listing);
  //  validation for schema
  // if(!newlisting.title){
  //   throw new ExpressError(400,"Title is missing!");
  // }
  // if(!newlisting.description){
  //   throw new ExpressError(400,"Description is missing!");
  // }
  // if(!newlisting.price){
  //   throw new ExpressError(400,"Price is missing!");
  // }
  // if(!newlisting.location){
  //   throw new ExpressError(400,"Location is missing!");
  // }
  // if(!newlisting.country){
  //   throw new ExpressError(400,"Country is missing!");
  // }

  newlisting.owner = req.user._id; //passport save user detailed
  newlisting.image={url,filename};
  await newlisting.save();
 
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
  res.render("listing/edit.ejs", { listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file!=="undefined"){
let url=req.file.path;
let filename=req.file.filename;

listing.image={url,filename};
await listing.save();
  }
  req.flash("success", "Listing Updated");

  res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const deletelist = await Listing.findByIdAndDelete(id);
  console.log(deletelist);
  req.flash("success", " Listing Deleted!");
  res.redirect("/listings");
};
