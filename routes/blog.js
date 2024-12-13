const express = require("express");
const Blog = require("../models/Blog");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Like = require("../models/Like");

router.get("/blog", (req, res) => {
  if (!req.user) {
    return res.redirect("/login"); // Redirect to login if user is not authenticated
  }
  res.render("add-blog", {
    user: req.user,
  });
});

// Configure Multer for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage: storage });

// Add blog route
router.post("/add-blog", upload.single("image"), async (req, res) => {
  const { title, description } = req.body;

  // Ensure file upload was successful
  if (!req.file) {
    return res.status(400).send("Image upload failed");
  }

  // Create a new blog post
  const newBlog = new Blog({
    title,
    description,
    image: req.file.filename, // Store only the filename in the database
    createdBy: req.user.userId, // Assuming `req.user` has user ID
  });

  try {
    await newBlog.save();
    res.redirect("/"); // Redirect to homepage or blog list page
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "createdBy",
      "username"
    );
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // Fetch other blogs excluding the current one
    const otherBlogs = await Blog.find({ _id: { $ne: blog._id } }).populate(
      "createdBy",
      "username"
    );

    res.render("blogDetails", {
      user: req.user,
      blog: blog,
      otherBlogs: otherBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/blogs/:id/like", async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.userId;

    if (!userId) {
      return res.redirect("/login");
    }

    const existingLike = await Like.findOne({ blog: blogId, user: userId });
    let updatedBlog;

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { likeCount: -1 } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Blog unliked",
        likeCount: updatedBlog.likeCount,
      });
    } else {
      await Like.create({ blog: blogId, user: userId });
      updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { likeCount: 1 } },
        { new: true }
      );
      return res.status(201).json({
        success: true,
        message: "Blog liked",
        likeCount: updatedBlog.likeCount,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
