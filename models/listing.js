const mongoose = require('mongoose');
const schema = mongoose.Schema;
const Review = require("./reviews");

const listingSchema = new schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    rating: {
        type: Number,
        default: () => parseFloat((Math.random() + 3.5).toFixed(1)), // generates value like 2.7, 3.2, etc.
    },
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
   
    },
    coordinates: {
      type: [Number],
 
    }
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing){
        await Review.deleteMany({ _id: { $in: listing.reviews}});
    }
});

const listing = mongoose.model("Listing", listingSchema);
module.exports = listing;