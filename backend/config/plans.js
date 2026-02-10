const plans = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    interval: "monthly",
    features: [
      "5 blog posts per month",
      "Basic analytics",
      "Community support"
    ]
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 499,
    currency: "INR",
    interval: "monthly",
    features: [
      "Unlimited posts",
      "Advanced analytics",
      "Priority support",
      "Custom domain"
    ]
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 999,
    currency: "INR",
    interval: "monthly",
    features: [
      "Everything in Pro",
      "AI content assistant",
      "White-label options",
      "24/7 dedicated support",
      "API access"
    ]
  }
};

export default plans;
