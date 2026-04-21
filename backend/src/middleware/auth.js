const { verifyToken } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

    // Debug logging
    if (!token) {
      console.log("Auth middleware - No token found");
      console.log("Cookies received:", req.cookies);
      console.log("Authorization header:", req.headers.authorization);
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.tokenType = decoded.tokenType;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { authenticate };
