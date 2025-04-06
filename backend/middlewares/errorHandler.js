export const errorHandler = (err, req, res, next) => {
  console.error("Error capturat:", err);

  res.status(err.status || 505).json({
    error: err.message || "Error intern del servidor",
    details: err.stack,
  });
};
