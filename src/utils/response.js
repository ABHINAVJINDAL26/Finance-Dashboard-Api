const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const error = (res, code, message, statusCode = 500, details = null) => {
  const payload = { success: false, error: { code, message } };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
