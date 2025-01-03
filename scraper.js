const puppeteer = require("puppeteer");
const Gmp = require("./models/Gmp");
const Blog = require("./models/Blog");

async function fetchGMPData(url) {
  let browser;
  try {
    // Launch browser with necessary args
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set user agent and headers to avoid detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Navigate to the target website
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract table data (first table on the page)
    const gmpData = await page.evaluate(() => {
      const table = document.querySelector("table"); // Select first table
      if (!table) return [];

      const rows = table.querySelectorAll("tbody tr");

      return Array.from(rows).map((row) => {
        const columns = row.querySelectorAll("td");
        return {
          ipoName: columns[0]?.innerText.trim() || "N/A",
          gmp: columns[1]?.innerText.trim() || "N/A",
          price: columns[2]?.innerText.trim() || "N/a",
          gain: columns[3]?.innerText.trim() || "N/A",
        };
      });
    });

    await saveGMPData(gmpData);
  } catch (error) {
    console.error("Error fetching GMP data:", error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function saveGMPData(gmpData) {
  try {
    for (const entry of gmpData) {
      const ipo = await Blog.findOne({
        title: { $regex: new RegExp(entry.ipoName, "i") },
      });
      if (ipo) {
        await Gmp.findOneAndUpdate(
          { ipo: ipo._id },
          {
            gain: entry.gain,
            gmpprice: entry.gmp,
            last_updated: new Date(),
          },
          { upsert: true, new: true }
        );
        console.log(`GMP updated for IPO: ${entry.ipoName}`);
      } else {
        console.log(`IPO not found for: ${entry.ipoName}`);
      }
    }
  } catch (error) {
    console.error("Error saving GMP data:", error);
  }
}

module.exports = {
  fetchGMPData,
};
