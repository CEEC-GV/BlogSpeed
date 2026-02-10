import crypto from "crypto";
import PaymentTransaction from "../models/PaymentTransaction.js";
import User from "../models/User.js";
import WebhookEvent from "../models/WebhookEvent.js";

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/webhooks/razorpay
 * @access  Public (verified via signature)
 */
export const handleRazorpayWebhook = async (req, res) => {
  // Always respond 200 to acknowledge receipt
  const acknowledgeWebhook = () => {
    res.status(200).json({ status: "ok" });
  };

  try {
    // Get signature from headers
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      console.error("Webhook Error: Missing Razorpay signature");
      return acknowledgeWebhook();
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook Error: RAZORPAY_WEBHOOK_SECRET not configured");
      return acknowledgeWebhook();
    }

    // Generate expected signature
    // Note: req.rawBody must be available (use raw body parser for this route)
    const body = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    // Validate signature
    const isValid = expectedSignature === signature;
    if (!isValid) {
      console.error("Webhook Error: Invalid signature");
      return acknowledgeWebhook();
    }

    // Parse webhook event
    const { event, payload, id: eventId } = req.body;
    console.log(`📩 Razorpay Webhook received: ${event}`);

    if (eventId) {
      const existingEvent = await WebhookEvent.findOne({ eventId });
      if (existingEvent) {
        return acknowledgeWebhook();
      }
      await WebhookEvent.create({ eventId, eventType: event });
    }

    const paymentEntity = payload?.payment?.entity;
    const subscriptionEntity = payload?.subscription?.entity;
    const notesUserId = paymentEntity?.notes?.userId;
    const notesPlanId = paymentEntity?.notes?.planId;

    let user = null;
    if (notesUserId) {
      user = await User.findById(notesUserId);
    } else if (subscriptionEntity?.id) {
      user = await User.findOne({ razorpaySubscriptionId: subscriptionEntity.id });
    }

    if (!user) {
      console.error("Webhook Error: User not found for event");
      return acknowledgeWebhook();
    }

    switch (event) {
      case "payment.captured": {
        if (paymentEntity?.id) {
          const existingPayment = await PaymentTransaction.findOne({
            razorpayPaymentId: paymentEntity.id
          });

          if (!existingPayment) {
            await PaymentTransaction.create({
              userId: user._id,
              razorpayOrderId: paymentEntity.order_id,
              razorpayPaymentId: paymentEntity.id,
              planId: notesPlanId || user.plan || "free",
              amount: paymentEntity.amount,
              currency: paymentEntity.currency,
              status: "paid"
            });
          }

          if (notesPlanId && notesPlanId !== user.plan) {
            user.plan = notesPlanId;
          }
          user.subscriptionStatus = "active";
          user.subscriptionStartDate = new Date();
          const baseDate = user.subscriptionEndDate && user.subscriptionEndDate > new Date()
            ? user.subscriptionEndDate
            : new Date();
          user.subscriptionEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        break;
      }

      case "subscription.charged": {
        if (paymentEntity?.id) {
          const existingPayment = await PaymentTransaction.findOne({
            razorpayPaymentId: paymentEntity.id
          });
          if (existingPayment) {
            break;
          }
          await PaymentTransaction.create({
            userId: user._id,
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
            planId: notesPlanId || user.plan || "free",
            amount: paymentEntity.amount,
            currency: paymentEntity.currency,
            status: "paid"
          });
        }

        user.subscriptionStatus = "active";
        const baseDate = user.subscriptionEndDate && user.subscriptionEndDate > new Date()
          ? user.subscriptionEndDate
          : new Date();
        user.subscriptionEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      }

      case "subscription.cancelled":
        user.subscriptionStatus = "cancelled";
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event}`);
    }

    await user.save();
    return acknowledgeWebhook();
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to Razorpay even on errors
    return acknowledgeWebhook();
  }
};

/**
 * Middleware to capture raw body for webhook signature verification
 * Use this before the webhook route
 */
export const captureRawBody = (req, res, buf) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString("utf8");
  }
};
