export const CREDIT_PLANS = [
  {
    id: "credits_70",
    credits: 70,
    amount: 49900, // ₹499 in paise
    name: "Starter Pack",
    description: "70 AI generation credits"
  },
  {
    id: "credits_150",
    credits: 150,
    amount: 99900, // ₹999 in paise
    name: "Pro Pack",
    description: "150 AI generation credits"
  }
];

export const getCreditPlan = (planId) => {
  return CREDIT_PLANS.find(plan => plan.id === planId);
};
