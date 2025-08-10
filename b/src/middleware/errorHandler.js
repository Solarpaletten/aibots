const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Prisma errors
  if (err.code === 'P2002') {
    error = {
      message: 'Duplicate entry',
      status: 409
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401
    };
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorHandler };
