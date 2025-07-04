/**
 * Middleware to add additional security headers beyond helmet defaults.
 */

function securityHeaders(req, res, next) {
  // Referrer-Policy header
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");

  // Permissions-Policy header (replaces Feature-Policy)
  // Customize the features as needed
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), fullscreen=*, payment=()"
  );

  // Expect-CT header to enforce Certificate Transparency
  // max-age is set to 86400 seconds (1 day), enforce true, report-uri can be added if needed
  res.setHeader("Expect-CT", "max-age=86400, enforce");

  // Strict-Transport-Security (HSTS) header
  // Only set if the request is secure (HTTPS)
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  next();
}

module.exports = securityHeaders;
