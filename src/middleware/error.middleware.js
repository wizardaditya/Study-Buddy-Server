function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[Error] ${req.method} ${req.path} — ${statusCode}: ${message}`);
  if (statusCode === 500) console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : message,
    ...(process.env.NODE_ENV === "development" && statusCode === 500 && { stack: err.stack }),
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
}

module.exports = { errorHandler, notFound };
