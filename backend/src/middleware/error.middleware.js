export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'API route not found.' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  let status = error.statusCode || 500;
  let message = status === 500 ? 'Internal server error.' : error.message;

  if (error.name === 'ValidationError') {
    status = 400;
    message = error.message;
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier.';
  } else if (error.code === 11000) {
    status = 409;
    message = 'A record with that value already exists.';
  }

  res.status(status).json({
    success: false,
    message,
  });
}
