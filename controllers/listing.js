const Listing = require("../models/listing.js");
const mongoose=require("mongoose");
module.exports.index = async (req, res) => {
	const categories = [
		"Trending",
		"Iconic City",
		"Mountain",
		"Castle",
		"Pool",
		"Camping",
		"Farm",
		"Arctic",
		"Spa",
		"Adventure",
		"Dining",
		"Meeting",
	];
	const allListings = await Listing.find({});
	res.render("listing/index.ejs", { allListings, categories });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
		req.flash("error", "Invalid Listing ID.");
		return res.redirect("/listings"); // Redirect to listings page if the ID is invalid
	}
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
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

  let url=req.file.path;
  let filename=req.file.filename;
  let newlisting = new Listing(req.body.listing);
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

module.exports.category=async (req, res) => {
	const { category } = req.params; // Get the category from the URL

	try {
		// Find listings that belong to the selected category
		const listings = await Listing.find({ category: category });

		if (listings.length === 0) {
			req.flash(
				"error",
				`No locations currently available in ${category}. Be the first to add a new location in this category!`
			);
			return res.redirect("/listings/new");
		}

		// Render the listings for the selected category
		res.render("listing/category", { category, listings });
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
};
