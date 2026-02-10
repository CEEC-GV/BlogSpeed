import crypto from "crypto";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import { CREDIT_PLANS } from "../config/plans.js";
import razorpay from "../services/razorpayClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create a Razorpay order for credit top-up
 * @route   POST /api/subscriptions/create-order
 * @access  Private
 */
export const createSubscription = asyncHandler(async (req, res) => {
  const creditPlanId = req.body.creditPlanId || req.body.planId;
  
  // Support both user and admin authentication
  const userId = req.user?._id || req.admin?._id;
  const isAdmin = !!req.admin;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }

  const plan = CREDIT_PLANS.find((item) => item.id === creditPlanId);
  if (!plan) {
    return res.status(400).json({
      success: false,
      message: "Invalid credit plan selected"
    });
  }

  try {
    const recentTransaction = await PaymentTransaction.findOne({
      userId: userId,
      planId: plan.id,
      status: "created",
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (recentTransaction?.razorpayOrderId) {
      return res.json({
        success: true,
        orderId: recentTransaction.razorpayOrderId,
        amount: recentTransaction.amount,
        currency: recentTransaction.currency,
        creditPlanId: plan.id,
        credits: plan.credits,
        planName: plan.name,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    }

    const userSuffix = userId.toString().slice(-8);
    const timeSuffix = Date.now().toString().slice(-10);
    const receipt = `ord_${userSuffix}_${timeSuffix}`;

    const order = await razorpay.orders.create({
      amount: plan.price,
      currency: "INR",
      receipt,
      notes: {
        userId: userId.toString(),
        creditPlanId: plan.id,
        credits: String(plan.credits),
        userType: isAdmin ? 'admin' : 'user'
      }
    });

    await PaymentTransaction.create({
      userId: userId,
      razorpayOrderId: order.id,
      planId: plan.id,
      amount: order.amount,
      currency: order.currency,
      status: "created"
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      creditPlanId: plan.id,
      credits: plan.credits,
      planName: plan.name,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message
    });
  }
});

/**
 * @desc    Verify Razorpay payment signature and apply credits
 * @route   POST /api/subscriptions/verify-payment
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    creditPlanId,
    planId
  } = req.body;

  const selectedPlanId = creditPlanId || planId;
  
  // Support both user and admin authentication
  const userId = req.user?._id || req.admin?._id;
  const isAdmin = !!req.admin;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification details"
    });
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature."
      });
    }

    const plan = CREDIT_PLANS.find((item) => item.id === selectedPlanId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid credit plan"
      });
    }

    const transaction = await PaymentTransaction.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Payment transaction not found"
      });
    }

    if (transaction.status === "paid" && transaction.razorpayPaymentId) {
      const currentUser = isAdmin 
        ? await Admin.findById(userId)
        : await User.findById(userId);
        
      return res.json({
        success: true,
        message: "Payment already verified",
        creditsAdded: plan.credits,
        creditBalance: currentUser?.creditBalance || 0
      });
    }

    // Find and update the user or admin
    const currentUser = isAdmin 
      ? await Admin.findById(userId)
      : await User.findById(userId);
      
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await PaymentTransaction.findByIdAndUpdate(transaction._id, {
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "paid"
    });

    currentUser.creditBalance = (currentUser.creditBalance || 0) + plan.credits;
    currentUser.totalCreditsPurchased = (currentUser.totalCreditsPurchased || 0) + plan.credits;
    currentUser.lastCreditTopupAt = new Date();

    await currentUser.save();

    res.json({
      success: true,
      message: "Payment verified and credits added",
      creditsAdded: plan.credits,
      creditBalance: currentUser.creditBalance,
      lastCreditTopupAt: currentUser.lastCreditTopupAt
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
});

/**
 * @desc    Get current user's subscription status
 * @route   GET /api/subscriptions/status
 * @access  Private
 */
export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  try {
    // Support both user and admin authentication
    const userId = req.user?._id || req.admin?._id;
    const isAdmin = !!req.admin;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const currentUser = isAdmin 
      ? await Admin.findById(userId).select("username email name creditBalance totalCreditsPurchased lastCreditTopupAt")
      : await User.findById(userId).select("plan subscriptionStatus subscriptionStartDate subscriptionEndDate creditBalance totalCreditsPurchased lastCreditTopupAt");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const response = {
      success: true,
      subscription: {
        creditBalance: currentUser.creditBalance || 0,
        totalCreditsPurchased: currentUser.totalCreditsPurchased || 0,
        lastCreditTopupAt: currentUser.lastCreditTopupAt
      }
    };

    // Add user-specific fields if it's a user (not admin)
    if (!isAdmin) {
      response.subscription.plan = currentUser.plan;
      response.subscription.status = currentUser.subscriptionStatus;
      response.subscription.startDate = currentUser.subscriptionStartDate;
      response.subscription.endDate = currentUser.subscriptionEndDate;
    }

    res.json(response);
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get subscription status",
      error: error.message
    });
  }
});
