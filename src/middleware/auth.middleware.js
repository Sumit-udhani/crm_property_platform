const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer token",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    const decoded = verifyToken(token);

    const user = await prisma.users.findUnique({
      where: { id: BigInt(decoded.userId) },
    });

    if (!user || user.token !== token) {
      return res.status(401).json({
        success: false,
        message: "Session expired or logged out. Please login again.",
      });
    }

    if (user.token_expires && new Date() > new Date(user.token_expires)) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    
    const userRole = await prisma.user_roles.findFirst({
      where: { user_id: BigInt(decoded.userId) },
      include: { roles: true },
    });

    req.user = {
      userId: decoded.userId,
      email:  user.email,
      role:   userRole?.roles?.name?.toLowerCase() || null,
        branch_id: user.branch_id ? user.branch_id.toString() : null,
    };

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