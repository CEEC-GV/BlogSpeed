import express from "express";
import { handleRazorpayWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// POST /api/webhooks/razorpay
// NOT protected - Razorpay needs to access this endpoint
// Uses express.raw() middleware for signature verification
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Convert raw body buffer to string for signature verification
    if (Buffer.isBuffer(req.body)) {
      req.rawBody = req.body.toString("utf8");
      req.body = JSON.parse(req.rawBody);
    }
    next();
  },
  handleRazorpayWebhook
);

export default router;
