const express = require("express");
const router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const Blog = require("../models/Blog");

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

router.put("/ipo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Extract fields from request body
    const updateData = {
      lotSize: req.body.lotSize,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      listingDate: req.body.listingDate,
      priceRange: req.body.priceRange,
      type: req.body.type,
      marketLot: req.body.marketLot,
      totalIssueSize: req.body.totalIssueSize,
      freshIssue: req.body.freshIssue,
      offerForSale: req.body.offerForSale,
      faceValue: req.body.faceValue,
      applyLink: req.body.applyLink,
      allotmentDate: req.body.allotmentDate,
      status: req.body.status,
    };

    // Update document
    const updatedIpo = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedIpo) {
      return res.status(404).json({ message: "IPO not found" });
    }

    res.status(200).json(updatedIpo.title);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

//Open-Souce Api
router.get("/ipodata", async (req, res) => {
  try {
    const ipos = await Blog.find().select("-description");
    res.status(200).json(ipos);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
