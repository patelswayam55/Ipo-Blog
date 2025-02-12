const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouters = require("./routes/user");
const userBlog = require("./routes/blog");
const path = require("path");
const cookieParser = require("cookie-parser");
const authenticateJWT = require("./middlewares/auth");
var cors = require("cors");
const Ipo = require("./routes/ipo");
const cron = require("node-cron");
const { fetchGMPData } = require("./scraper");
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_ONLINE_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("MongoDb Connection Error", err);
  });

app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve("public")));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/", authenticateJWT, userRouters);
app.use("/", userBlog);
app.use("/", Ipo);

// Cron Job - Run every day at 9 PM
cron.schedule(
  "01 10 * * *",
  async () => {
    console.log("Running scraper at 9 PM...");
    const targetUrl = process.env.Scraperurl;
    await fetchGMPData(targetUrl);
  },
  {
    timezone: "Asia/Kolkata",
  }
);

const PORT = process.env.PORT;
const a = `http://localhost:${PORT}`;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${a} `);
});
