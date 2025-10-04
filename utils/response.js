function successResponse(res, data = {}, message = "Success", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = "Something went wrong", status = 500, errors = null) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

function notFoundResponse(res, message = "Resource not found") {
  return res.status(404).json({
    success: false,
    message,
  });
}

function forbiddenResponse(res, message = "Forbidden") {
  return res.status(403).json({
    success: false,
    message,
  });
}

function unauthorizedResponse(res, message = "Unauthorized") {
  return res.status(401).json({
    success: false,
    message,
  });
}

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  unauthorizedResponse,
};
