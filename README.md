IPO Application

Overview

The IPO Application is a web-based platform designed to track IPOs (Initial Public Offerings) and their corresponding GMP (Grey Market Premium). The application scrapes GMP data from external websites, stores it in MongoDB, and displays it on the frontend using EJS templating.

Features

IPO Tracking: View detailed IPO listings including start, close, and allotment dates.

GMP Updates: Automatically scrape and update GMP data every day at 9 PM.

Admin Panel: Manage IPO data via a simple interface.

Daily Quote: Display daily motivational quotes alongside IPO information.

Tech Stack

Backend: Node.js, Express.js

Frontend: EJS (Embedded JavaScript)

Database: MongoDB

Web Scraping: Puppeteer

Scheduling: Node-cron

Future Enhancements

Email Notifications for IPO updates.

Graphical Charts to visualize GMP trends.

Admin Dashboard for easier management.

Caching to improve performance.

Contributing

Pull requests are welcome! For major changes, open an issue to discuss what you’d like to improve.
