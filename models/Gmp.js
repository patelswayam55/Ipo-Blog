const Blog = require("./Blog");
const mongoose = require("mongoose");

const gmpSchema = new mongoose.Schema(
  {
    ipo: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    gain: String,
    gmpprice: String,
    last_updated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gmp", gmpSchema);
