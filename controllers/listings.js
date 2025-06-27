const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Check if geometry is missing
    if (!listing.geometry || !listing.geometry.type || !listing.geometry.coordinates?.length) {
        console.log("Missing coordinates. Fetching from Mapbox for:", listing.location);

        try {
            const response = await geocodingClient
                .forwardGeocode({
                    query: listing.location,
                    limit: 1,
                })
                .send();

            if (response.body.features.length > 0) {
                listing.geometry = response.body.features[0].geometry;
                await listing.save(); 
            } else {
                console.warn("Mapbox could not find coordinates for:", listing.location);
            }
        } catch (err) {
            console.error("Error fetching coordinates from Mapbox:", err.message);
        }
    }

    res.render("listings/show", { listing });
};


module.exports.createListing = async (req, res, next) => {
   let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location, 
  limit: 1
})
  .send(); 

    let url = req.file.path;
    let filename = req.file.filename;
   const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
   newListing.image = {url, filename};

   newListing.geometry = response.body.features[0].geometry;

   let savedListing = await newListing.save();
    req.flash("success", "New Listing Created!");
   res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id); 
        if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
         return res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit", {listing, originalImageUrl});
};


module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
         let url = req.file.path;
         let filename = req.file.filename;
         listing.image = { url, filename };
         await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};