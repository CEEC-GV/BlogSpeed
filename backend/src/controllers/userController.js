import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sanitizeText } from "../utils/sanitize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = asyncHandler(async (req, res) => {
  const name = sanitizeText(req.body.name);
  const email = sanitizeText(req.body.email).toLowerCase();
  const password = req.body.password || "";

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
    plan: "free",
    subscriptionStatus: "active"
  });

  res.status(201).json({
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      creditBalance: user.creditBalance,
      totalCreditsPurchased: user.totalCreditsPurchased,
      lastCreditTopupAt: user.lastCreditTopupAt
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = sanitizeText(req.body.email).toLowerCase();
  const password = req.body.password || "";

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      creditBalance: user.creditBalance,
      totalCreditsPurchased: user.totalCreditsPurchased,
      lastCreditTopupAt: user.lastCreditTopupAt
    }
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      plan: req.user.plan,
      subscriptionStatus: req.user.subscriptionStatus,
      creditBalance: req.user.creditBalance,
      totalCreditsPurchased: req.user.totalCreditsPurchased,
      lastCreditTopupAt: req.user.lastCreditTopupAt
    }
  });
});
