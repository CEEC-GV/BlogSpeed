import express from "express";
import { protectBoth } from "../middleware/auth.js";
import { subscriptionLimiter } from "../middleware/rateLimiter.js";
import {
  createSubscription,
  verifyPayment,
  getSubscriptionStatus
} from "../controllers/subscriptionController.js";

const router = express.Router();

// POST /api/subscriptions/create-order
// Protected - requires user or admin authentication
router.post("/create-order", subscriptionLimiter, protectBoth, createSubscription);

// POST /api/subscriptions/verify-payment
// Protected - requires user or admin authentication
router.post("/verify-payment", subscriptionLimiter, protectBoth, verifyPayment);

// GET /api/subscriptions/status
// Protected - requires user or admin authentication
router.get("/status", subscriptionLimiter, protectBoth, getSubscriptionStatus);

export default router;
