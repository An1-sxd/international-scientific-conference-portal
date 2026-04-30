import jwt from "jsonwebtoken";

import Admin from "../models/admin.model.js";
import { sendError } from "../routes/public/helpers.js";

/**
 * Authenticate admin via HTTP-only cookie.
 * Attaches req.admin on success.
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return sendError(res, 401, "Authentication required. Please log in.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return sendError(res, 401, "Admin account no longer exists.");
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return sendError(res, 401, "Invalid or expired token. Please log in again.");
    }
    return sendError(res, 500, "Authentication error.");
  }
};

/**
 * Authorize admin by role(s).
 * Must be used after authenticateAdmin.
 *
 * @param  {...string} roles - Allowed roles (e.g. "ADMIN", "REVIEWER")
 */
export const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return sendError(res, 401, "Authentication required.");
    }

    if (roles.length > 0 && !roles.includes(req.admin.role)) {
      return sendError(res, 403, "You do not have permission to perform this action.");
    }

    next();
  };
};
