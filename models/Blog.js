const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likeCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Blog', blogSchema)
