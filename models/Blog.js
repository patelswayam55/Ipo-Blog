const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lotSize: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    listingDate: { type: Date },
    allotmentDate: { type: Date },
    priceRange: { type: String },
    type: {
      type: String,
      enum: ["Mainboard", "SME"],
    },
    marketLot: {
      retail: {
        shares: { type: Number },
        amount: { type: Number },
      },
      sHni: {
        shares: { type: Number },
        amount: { type: Number },
      },
      bHni: {
        shares: { type: Number },
        amount: { type: Number },
      },
    },
    totalIssueSize: { type: String },
    freshIssue: { type: String },
    offerForSale: { type: String },
    applyLink: { type: String },
    faceValue: { type: Number },

    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
