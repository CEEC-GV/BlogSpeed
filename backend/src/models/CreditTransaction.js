import mongoose from "mongoose";

/**
 * Credit Transaction Model
 * 
 * Logs every credit deduction and addition for audit trail
 * Helps track user spending and detect issues
 */
const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    action: {
      type: String,
      enum: ["deduct", "add", "refund"],
      required: true
    },
    feature: {
      type: String,
      required: true,
      // Examples: "seo_title", "meta_description", "blog_content", "top_up", "refund"
      index: true
    },
    previousBalance: {
      type: Number,
      required: true,
      min: 0
    },
    newBalance: {
      type: Number,
      required: true,
      min: 0
    },
    metadata: {
      // Additional context (e.g., blog ID, request ID, etc.)
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success"
    },
    notes: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Index for quick lookups by user and date range
creditTransactionSchema.index({ userId: 1, createdAt: -1 });

// Index for analytics
creditTransactionSchema.index({ feature: 1, action: 1, createdAt: -1 });

export default mongoose.model("CreditTransaction", creditTransactionSchema);
