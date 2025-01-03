const Blog = require("../models/Blog");
const User = require("../models/User");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Gmp = require("../models/Gmp");

let dailyQuote = null;
let lastFetchDate = null;

async function fetchDailyQuote() {
  const today = new Date().toISOString().split("T")[0]; // Get the current date in "YYYY-MM-DD" format

  if (!dailyQuote || lastFetchDate !== today) {
    try {
      // Fetch a quote from a third-party API
      const response = await fetch("https://zenquotes.io/api/today");
      const data = await response.json();

      dailyQuote = {
        text: data[0]?.q || "Keep going, you are doing great!",
        author: data[0]?.a || "Unknown",
      };
      lastFetchDate = today;
    } catch (error) {
      dailyQuote = {
        text: "Keep going, you are doing great!",
        author: "Unknown",
      };
    }
  }

  return dailyQuote;
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Modify the homepage function to fetch the quote once
async function homepage(req, res) {
  try {
    const ipos = await Blog.find().populate("createdBy", "username");

    const quote = await fetchDailyQuote(); // Only fetch the quote if it's a new day

    // Fetch GMP data and map by IPO
    const gmpData = await Gmp.find().populate("ipo", "title");

    const formattedIpos = ipos.map((ipo) => {
      const matchingGmp = gmpData.find(
        (gmp) => gmp.ipo.title === ipo.title // Match by title
      );

      return {
        ...ipo._doc,
        startDateFormatted: formatDate(ipo.startDate),
        closeDateFormatted: formatDate(ipo.endDate),
        allotmentDateFormatted: formatDate(ipo.allotmentDate),
        listingDateFormatted: formatDate(ipo.listingDate),
        gmpPrice: matchingGmp ? matchingGmp.gmpprice : "N/A",
        gmpGain: matchingGmp ? matchingGmp.gain : "N/A",
      };
    });

    res.render("home", {
      user: req.user,
      ipos: formattedIpos || null,
      dailyQuote: quote,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
}

const changepassword = async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await User.findById(req.user.userId);
  const isPasswordCorrect = await user.comparePassword(oldpassword);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }
  user.password = newpassword;
  await user.save({
    validateBeforeSave: false,
  });
  res.json({ message: "Password changed successfully" });
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.render("reset-password", { error: "Email not found" });
  }

  const resetToken = jwt.sign(
    { userId: user._id, email },
    process.env.RESET_PASSWORD_SECRET,
    {
      expiresIn: "1h",
    }
  );

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
       
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #5c67f2;
            color: white;
            padding: 1em;
            text-align: center;
        }
        .content {
            padding: 2em;
        }
        .content h2 {
            color: #5c67f2;
        }
        .button {
            display: block;
            width: 200px;
            margin: 2em auto;
            padding: 10px 20px;
            text-align: center;
            background-color: #5c67f2;
            color: #fbfbfb;
            text-decoration: none;
            border-radius: 5px;
        }
        #uniq {
            color: #f8f9fb !important;
        }
        .button:hover {
            background-color: #4a52c7;
        }
        .footer {
            text-align: center;
            padding: 1em;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <h2>Hello,</h2>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="{{RESET_URL}}" id="uniq" class="button">Reset Password</a>
            <p>If you did not request this, please ignore this email or contact support if you have questions.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  // var transporter = nodemailer.createTransport({
  //   host: "sandbox.smtp.mailtrap.io",
  //   port: 2525,
  //   auth: {
  //     user: "d16f374053e857",
  //     pass: "1c37a68a8c4ffe",
  //   },
  // });
  var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `http://${req.headers.host}/reset-password-form/${resetToken}`;
  const emailHtml = htmlTemplate.replace("{{RESET_URL}}", resetUrl);

  const mailOptions = {
    from: "Blogify Support",
    to: email,
    subject: "Password Reset Request",
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);

    res.render("reset-password", { message: "Password reset email sent!" });
  } catch (err) {
    res.render("reset-password", {
      error: "Failed to send email. Try again later.",
    });
  }
};

const resetPasswordForm = async (req, res) => {
  const { token } = req.params;

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

    // Render a form for the user to reset their password
    res.render("reset-password-form", { token });
  } catch (err) {
    return res.render("reset-password", {
      error: "Token is invalid or expired",
    });
  }
};

const resetPasswordSubmit = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.render("reset-password", { error: "Invalid token" });
    }

    if (newPassword != confirmPassword) {
      return res.render("reset-password-form", {
        error: "Passwords do not match",
        token,
      });
    }

    user.password = newPassword;
    await user.save();

    res.render("login", {
      message: "Password reset successfully. Please log in.",
    });
  } catch (err) {
    res.render("reset-password", {
      error: "Token is invalid or expired",
    });
  }
};
module.exports = {
  homepage,
  changepassword,
  resetPasswordRequest,
  resetPasswordForm,
  resetPasswordSubmit,
};
