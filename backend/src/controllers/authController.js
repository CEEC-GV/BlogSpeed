import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sanitizeText } from "../utils/sanitize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const loginAdmin = asyncHandler(async (req, res) => {
  const raw = sanitizeText(req.body.username).toLowerCase().trim();
  const password = req.body.password || "";

  // Accept "username" or "user@example.com" — look up by username, using part before @ if it looks like email
  const username = raw.includes("@") ? raw.split("@")[0] : raw;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: signToken(admin._id),
    admin: { 
      id: admin._id, 
      username: admin.username,
      email: admin.email,
      name: admin.name,
      creditBalance: admin.creditBalance || 0,
      totalCreditsPurchased: admin.totalCreditsPurchased || 0,
      lastCreditTopupAt: admin.lastCreditTopupAt
    }
  });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const username = sanitizeText(req.body.username).toLowerCase();
  const password = req.body.password || "";

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    return res.status(409).json({ message: "Admin already exists" });
  }

  // Create new admin
  const admin = await Admin.create({
    username,
    password // Assumes your Admin model hashes password in pre-save hook
  });

  res.status(201).json({
    token: signToken(admin._id),
    admin: { 
      id: admin._id, 
      username: admin.username,
      email: admin.email,
      name: admin.name,
      creditBalance: admin.creditBalance || 0,
      totalCreditsPurchased: admin.totalCreditsPurchased || 0,
      lastCreditTopupAt: admin.lastCreditTopupAt
    }
  });
});

export const getAdminMe = asyncHandler(async (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      name: req.admin.name,
      creditBalance: req.admin.creditBalance || 0,
      totalCreditsPurchased: req.admin.totalCreditsPurchased || 0,
      lastCreditTopupAt: req.admin.lastCreditTopupAt
    }
  });
});

export const getUserInfo = asyncHandler(async (req, res) => {
  const user = await Admin.findById(req.user._id).select("-password");
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: user._id,
    username: user.username,
    creditBalance: user.creditBalance || 0,
    totalCreditsPurchased: user.totalCreditsPurchased || 0,
    lastCreditTopupAt: user.lastCreditTopupAt,
    createdAt: user.createdAt
  });
});