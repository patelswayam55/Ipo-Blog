const express = require("express");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/Blog");
const authenticateJWT = require("../middlewares/auth");

const {
  homepage,
  resetPasswordRequest,
  resetPasswordForm,
  resetPasswordSubmit,
} = require("../controllers/user");

router.get("/", homepage);

router.get("/resetpass", (req, res) => {
  res.render("reset-password");
});

// Route to handle the initial reset password request mail send
router.post("/user/reset-password", resetPasswordRequest);

// Route to display the reset password form (with token validation)
router.get("/reset-password-form/:token", resetPasswordForm);

// Route to handle the new password submission
router.post("/reset-password-form", resetPasswordSubmit);

router.get("/login", (req, res) => {
  res.render("login", {
    user: req.user || null,
  });
});

router.get("/register", (req, res) => {
  res.render("signup");
});

router.post("/user/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render("signup", {
      error: "Please fill in all fields",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already in use",
      });
    }
    const existingUser1 = await User.findOne({ username });
    if (existingUser1) {
      return res.render("signup", {
        error: "Username Alredy Taken!",
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // return res.redirect("/login");
    res.render("signup", {
      message: "Your Account Created Successfully.You Can Login!!!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/user/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("signup", { error: "Please fill in all fields" }); // Render with error message
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { error: "Invalid Username" }); // Render with error message
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid Password" });
    }
    const payload = {
      userId: user._id,
      username: user.username,
      imageurl: user.profileImage,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(400).send("Invalid email or password");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
});

module.exports = router;
