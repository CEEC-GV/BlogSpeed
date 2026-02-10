import api from "../api/axios.js";

// Razorpay Key ID from environment
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Load Razorpay checkout script dynamically
 * @returns {Promise<void>}
 */
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay SDK"))
      );
      return;
    }

    // Create and append script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
};

/**
 * Initiate Razorpay payment flow
 * @param {string} creditPlanId - The credit plan ID to top up
 * @param {Object} user - User object with email, name, phone
 * @param {Object} callbacks - Callback functions for success, error, dismiss
 * @returns {Promise<Object>} - Payment result
 */
export const initiateRazorpayPayment = async (creditPlanId, user = {}, callbacks = {}) => {
  const { onSuccess, onError, onDismiss } = callbacks;

  try {
    // Step 1: Create order on backend (axios interceptor handles auth)
    const orderRes = await api.post(
      "/subscriptions/create-order",
      { creditPlanId }
    );

    if (!orderRes.data.success) {
      throw new Error(orderRes.data.message || "Failed to create order");
    }

    // Step 2: Load Razorpay script
    await loadRazorpayScript();

    // Step 3: Open Razorpay checkout
    return new Promise((resolve, reject) => {
      const options = {
        key: orderRes.data.keyId || RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency || "INR",
        name: "BlogSpeed Credits",
        description: `${orderRes.data.planName || creditPlanId} Top-Up`,
        order_id: orderRes.data.orderId,
        image: "/logo.png", // Optional: Add your logo

        // Payment success handler
        handler: async function (response) {
          try {
            // Verify payment on backend (axios interceptor handles auth)
            const verifyRes = await api.post(
              "/subscriptions/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                creditPlanId: creditPlanId
              }
            );

            if (verifyRes.data.success) {
              const result = {
                success: true,
                creditPlanId: creditPlanId,
                planName: orderRes.data.planName,
                creditsAdded: verifyRes.data.creditsAdded || orderRes.data.credits,
                message: "Credits added successfully!",
                paymentId: response.razorpay_payment_id
              };

              if (onSuccess) onSuccess(result);
              resolve(result);
            } else {
              const error = new Error("Payment verification failed");
              if (onError) onError(error);
              reject(error);
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            const error = new Error(
              err.response?.data?.message || "Payment verification failed"
            );
            if (onError) onError(error);
            reject(error);
          }
        },

        // Modal dismissed handler
        modal: {
          ondismiss: function () {
            const result = {
              success: false,
              cancelled: true,
              message: "Payment was cancelled"
            };
            if (onDismiss) onDismiss(result);
            resolve(result);
          },
          escape: true,
          animation: true
        },

        // Prefill user details
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || ""
        },

        // Notes for tracking
        notes: {
          creditPlanId: creditPlanId,
          userId: user.id || user._id || ""
        },

        // Theme customization
        theme: {
          color: "#7c3aed", // Purple theme matching BlogSpeed
          backdrop_color: "rgba(0, 0, 0, 0.8)"
        },

        // Config options
        config: {
          display: {
            blocks: {
              utib: {
                name: "Pay using UPI",
                instruments: [
                  { method: "upi" }
                ]
              },
              other: {
                name: "Other Payment Methods",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.utib", "block.other"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };

      try {
        const razorpay = new window.Razorpay(options);

        // Handle payment failures
        razorpay.on("payment.failed", function (response) {
          console.error("Payment failed:", response.error);
          const error = new Error(
            response.error.description || "Payment failed. Please try again."
          );
          error.code = response.error.code;
          error.reason = response.error.reason;
          if (onError) onError(error);
          reject(error);
        });

        razorpay.open();
      } catch (err) {
        console.error("Razorpay initialization error:", err);
        const error = new Error("Failed to initialize payment gateway");
        if (onError) onError(error);
        reject(error);
      }
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    const error = new Error(
      err.response?.data?.message || err.message || "Failed to initiate payment"
    );
    if (onError) onError(error);
    throw error;
  }
};

/**
 * Get available plans from backend
 * @returns {Promise<Array>} - Array of plan objects
 */
export const getPlans = async () => {
  try {
    const res = await api.get("/subscriptions/plans");
    return res.data.plans || [];
  } catch (err) {
    console.error("Failed to fetch plans:", err);
    throw err;
  }
};

/**
 * Get current subscription status
 * @returns {Promise<Object>} - Subscription details
 */
export const getSubscriptionStatus = async () => {
  try {
    const res = await api.get("/subscriptions/status");
    return res.data.subscription || null;
  } catch (err) {
    console.error("Failed to fetch subscription:", err);
    throw err;
  }
};

export default initiateRazorpayPayment;
