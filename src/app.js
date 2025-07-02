const path = require("path");
require("dotenv").config();

const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");

const app = express();

// Middleware: Kompresi response
app.use(compression());

// Middleware: Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        mediaSrc: ["'self'", "data:"], // <-- tambahkan baris ini
      },
    },
  })
);

// Middleware: CORS
const origin = process.env.ORIGIN || "your_origin";
app.use(cors({ origin }));

// Middleware: JSON body parser
app.use(express.json());

// Middleware: Rate limiting
if (process.env.NODE_ENV !== "test") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
}

// API Routes
app.use("/api/v1", routes);

// Static Pages
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../public/pages/index.html"));
});
app.get("/docs", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../public/pages/docs.html"));
});

// Error handling middleware (harus paling bawah)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
