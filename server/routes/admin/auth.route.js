import express from "express";
import jwt from "jsonwebtoken";

import Admin from "../../models/admin.model.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";
import { handleModelError, sendError } from "../public/helpers.js";

const router = express.Router();

const COOKIE_NAME = "admin_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (admin) =>
  jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ── POST /auth/login ──
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return sendError(res, 401, "Invalid email or password.");
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password.");
    }

    const token = generateToken(admin);

    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.json({
      success: true,
      data: {
        admin: {
          _id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    return handleModelError(res, error);
  }
});

// ── POST /auth/logout ──
router.post("/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({ success: true, message: "Logged out successfully." });
});

// ── GET /auth/me ── (protected)
router.get("/auth/me", authenticateAdmin, (req, res) => {
  return res.json({
    success: true,
    data: {
      admin: {
        _id: req.admin._id,
        fullName: req.admin.fullName,
        email: req.admin.email,
        role: req.admin.role,
      },
    },
  });
});

export default router;
