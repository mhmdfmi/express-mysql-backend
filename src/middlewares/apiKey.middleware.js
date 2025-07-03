module.exports = (req, res, next) => {
  // Lewati validasi API key jika environment adalah test
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const apiKey = req.header("x-api-key") || req.query.api_key;
  const validApiKeys = (process.env.API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }
  next();
};
