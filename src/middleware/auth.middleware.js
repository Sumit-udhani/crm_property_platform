const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    // 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer token",
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    // 4. Verify JWT signature
    const decoded = verifyToken(token);

    // 5. Check token exists in DB and not expired
    const user = await prisma.users.findUnique({
      where: { id: BigInt(decoded.userId) }
    })

    if (!user || user.token !== token) {
      return res.status(401).json({
        success: false,
        message: "Session expired or logged out. Please login again.",
      })
    }

    if (user.token_expires && new Date() > new Date(user.token_expires)) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      })
    }

    // 6. Attach user to request
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;