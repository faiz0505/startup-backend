const { getAuth } = require("@clerk/express");
const { unauthorizedResponse } = require("../../utils/response");

function authMiddleware(req, res, next) {
  try {    
    const { userId } = getAuth(req);
    if (!userId) {
      return unauthorizedResponse(res);
    }

    // Optional: attach user info to request for later use
    req.userId = userId;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return unauthorizedResponse(res, "Invalid token");
  }
}

module.exports = { authMiddleware };
