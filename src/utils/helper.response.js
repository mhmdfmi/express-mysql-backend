function success(res, data = null, message = "success", statusCode = 200) {
  if (data !== null) {
    return res.status(statusCode).json({ statusCode, message, data });
  }
  return res.status(statusCode).json({ statusCode, message });
}

function error(res, message = "error", statusCode = 400) {
  return res.status(statusCode).json({ statusCode, message });
}

module.exports = { success, error };
