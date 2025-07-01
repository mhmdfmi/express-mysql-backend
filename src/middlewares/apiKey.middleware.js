module.exports = (req, res, next) => {
  const apiKey = req.header("api-key") || req.query.api_key;
  const validApiKeys = (process.env.API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }
  next();
};
