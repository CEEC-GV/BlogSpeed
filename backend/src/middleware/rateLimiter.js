import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 10 to 100
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

export const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 20 to 100
  message: "Too many subscription requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});
