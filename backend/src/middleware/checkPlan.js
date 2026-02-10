/**
 * Check Plan Middleware
 * Verifies if the user has the required plan and active subscription
 * 
 * Usage: checkPlan('pro', 'premium') - allows pro and premium users
 * Usage: checkPlan('free', 'pro', 'premium') - allows all plans
 */

export const checkPlan = (...allowedPlans) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first."
      });
    }

    const userPlan = req.user.plan || "free";
    const subscriptionStatus = req.user.subscriptionStatus || "inactive";

    // Check if user's plan is in allowed plans
    if (!allowedPlans.includes(userPlan)) {
      // Find the minimum required plan for the error message
      const planHierarchy = ["free", "pro", "premium"];
      const requiredPlan = allowedPlans.find(p => planHierarchy.includes(p)) || allowedPlans[0];

      return res.status(403).json({
        success: false,
        message: `Upgrade to ${requiredPlan} plan to access this feature`,
        currentPlan: userPlan,
        requiredPlans: allowedPlans
      });
    }

    // For paid plans, check if subscription is active
    if (userPlan !== "free" && subscriptionStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your subscription is not active. Please renew to access this feature.",
        currentPlan: userPlan,
        subscriptionStatus: subscriptionStatus
      });
    }

    // User has access
    next();
  };
};

/**
 * Check if user has at least the specified plan level
 * Plans hierarchy: free < pro < premium
 */
export const checkPlanLevel = (minimumPlan) => {
  const planHierarchy = { free: 0, pro: 1, premium: 2 };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first."
      });
    }

    const userPlan = req.user.plan || "free";
    const subscriptionStatus = req.user.subscriptionStatus || "inactive";
    const userPlanLevel = planHierarchy[userPlan] || 0;
    const requiredLevel = planHierarchy[minimumPlan] || 0;

    if (userPlanLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Upgrade to ${minimumPlan} plan to access this feature`,
        currentPlan: userPlan,
        requiredPlan: minimumPlan
      });
    }

    // For paid plans, check if subscription is active
    if (userPlan !== "free" && subscriptionStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your subscription is not active. Please renew to access this feature.",
        currentPlan: userPlan,
        subscriptionStatus: subscriptionStatus
      });
    }

    next();
  };
};

export default checkPlan;
