const express = require("express");
const router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function fetchIpoDetails() {
  try {
    const url = "https://api.ipoalerts.in/ipos?status=open";
    const options = {
      method: "GET",
      headers: {
        "x-api-key": process.env.IPO_KEY,
      },
    };
    const response = await fetch(url, options);
    const data = await response.json();

    return data.ipos; // Ensure data is returned
  } catch (error) {
    console.error("Error fetching IPO details:", error);
    return []; // Return an empty array in case of error
  }
}

router.get("/ipo", async (req, res) => {
  const ipo = await fetchIpoDetails();

  res.render("ipo", {
    user: req.user,
    ipos: ipo,
  });
});

module.exports = router;
