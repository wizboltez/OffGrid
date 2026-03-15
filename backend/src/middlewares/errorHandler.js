export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "NOT_FOUND",
    },
  });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      details: err.details || null,
    },
  });
}
