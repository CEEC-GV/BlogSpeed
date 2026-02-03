import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sanitizeText } from "../utils/sanitize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const loginAdmin = asyncHandler(async (req, res) => {
  const username = sanitizeText(req.body.username).toLowerCase();
  const password = req.body.password || "";

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
    admin: { id: admin._id, username: admin.username }
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
    admin: { id: admin._id, username: admin.username }
  });
});