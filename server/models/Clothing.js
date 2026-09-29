
const mongoose = require('mongoose')

const clothingSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    brand:    String,
    category: { type: String, enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'ethnic'], required: true },
    type:     String,   // shirt, tshirt, jeans, dress, kurta, etc.

    color:   String,
    pattern: String,
    occasion: [{ type: String }],

    price: { type: Number, required: true, min: 0 },

    imageUrl:         String,
    overlayColor:     String,
    overlaySecondary: String,

    fitType:      String,
    neckStyle:    String,
    sleeveLength: String,

    recommendedFor: [{ type: String, enum: ['warm', 'cool', 'neutral'] }],
    tags: [String],

    rating:  { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },

    externalLink: String,   // Amazon / Flipkart product URL
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
)
)

clothingSchema.index({ category: 1, color: 1, occasion: 1 })
clothingSchema.index({ tags: 1 })

module.exports = mongoose.model('Clothing', clothingSchema)
