const mongoose = require("mongoose");
const Blog = require("./Blog");
const User = require("./User");

const likeSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", requied: true },
  },
  {
    timestamps: true,
  }
);

likeSchema.index(
  {
    blog: 1,
    user: 1,
  },
  { unique: true }
);

// export const Like = mongoose.model("Like", likeSchema);

module.exports = mongoose.model("Like", likeSchema);
