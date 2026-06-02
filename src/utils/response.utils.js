function sendSuccess(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function sendError(res, message = "Internal Server Error", statusCode = 500, errors) {
  return res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
}

function sendPaginated(res, data, pagination) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  return res.status(200).json({
    success: true,
    data,
    pagination: { ...pagination, totalPages, hasMore: pagination.page < totalPages },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
