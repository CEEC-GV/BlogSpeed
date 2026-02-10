import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    planId: {
      type: String,
      enum: ["free", "pro", "premium", "credits_70", "credits_150"],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    },
    signature: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentTransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);
