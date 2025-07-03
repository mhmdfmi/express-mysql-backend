const path = require("path");
require("dotenv").config();

const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csurf = require("csurf");

const routes = require("./routes");

const app = express();

// Compression middleware
app.use(compression());

// Helmet untuk security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        mediaSrc: ["'self'", "data:"],
      },
    },
  })
);

// Additional security headers beyond helmet defaults
const securityHeaders = require("./middlewares/securityHeaders.middleware");
app.use(securityHeaders);

// CORS
const origin = process.env.ORIGIN || "http://localhost:3001";
app.use(cors({ origin, credentials: true }));

// Cookie & JSON parser
app.use(cookieParser());
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set ke true jika menggunakan HTTPS
  })
);

// Middleware CSRF Protection (directly in app.js)
app.use(cookieParser());
app.use(
  csurf({
    cookie: false,
  })
);

// Middleware rate limiting
if (process.env.NODE_ENV !== "test") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
}

// Endpoint untuk mengambil CSRF token (dipakai frontend)
app.get("/api/v1/csrf-token", (req, res, next) => {
  try {
    if (typeof req.csrfToken !== "function") {
      return res
        .status(500)
        .json({ error: "CSRF token function not available" });
    }
    const token = req.csrfToken();
    res.json({ csrfToken: token });
  } catch (err) {
    next(err);
  }
});

// Gunakan route utama
app.use("/api/v1", routes);

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/public", express.static(path.join(__dirname, "../public")));

// Public pages
app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../public/pages/index.html"));
});
app.get("/docs", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../public/pages/docs.html"));
});

// Error handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res
      .status(403)
      .json({ error: "Token CSRF tidak valid atau hilang" });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
