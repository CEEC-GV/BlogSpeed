import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Crown, Zap } from "lucide-react";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { initiateRazorpayPayment } from "../utils/razorpayCheckout.js";
import { useUser } from "../context/UserContext.jsx";
import { useAdmin } from "../context/AdminContext.jsx";

const creditPlans = [
  {
    id: "credits_70",
    name: "70 Credits",
    credits: 70,
    price: 499,
    highlight: false,
    icon: Zap,
    features: [
      "Ideal for occasional AI usage",
      "SEO titles, meta, and gap analysis",
      "Light content generation"
    ]
  },
  {
    id: "credits_150",
    name: "150 Credits",
    credits: 150,
    price: 999,
    highlight: true,
    icon: Crown,
    features: [
      "Best value for weekly publishing",
      "Full AI content workflows",
      "Priority generation capacity"
    ]
  }
];

export default function PricingPage() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  
  // Use appropriate context based on route
  let userContext, adminContext;
  
  try {
    userContext = useUser();
  } catch (e) {
    userContext = null;
  }
  
  try {
    adminContext = useAdmin();
  } catch (e) {
    adminContext = null;
  }
  
  const { user, loading: userLoading, refreshUser } = userContext || { user: null, loading: false, refreshUser: () => {} };
  const { admin, loading: adminLoading, refreshAdmin } = adminContext || { admin: null, loading: false, refreshAdmin: () => {} };
  
  // Determine which account to use
  const currentAccount = isAdminRoute ? admin : user;
  const loading = isAdminRoute ? adminLoading : userLoading;
  const refreshAccount = isAdminRoute ? refreshAdmin : refreshUser;
  
  const [upgrading, setUpgrading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpgrade = async (creditPlanId) => {
    if (!currentAccount) {
      showToast("Please login to top up", "error");
      return;
    }

    setUpgrading(creditPlanId);

    try {
      const result = await initiateRazorpayPayment(
        creditPlanId,
        currentAccount,
        {
          onSuccess: (res) => {
            const creditsAdded = res.creditsAdded || 0;
            showToast(
              creditsAdded
                ? `Added ${creditsAdded} credits successfully.`
                : "Credits added successfully."
            );
            setUpgrading(null);
            refreshAccount();
          },
          onError: (err) => {
            showToast(err.message || "Payment failed", "error");
            setUpgrading(null);
          },
          onDismiss: () => {
            showToast("Payment cancelled", "error");
            setUpgrading(null);
          }
        }
      );

      if (result && result.cancelled) {
        setUpgrading(null);
      }
    } catch (err) {
      console.error("Top up error:", err);
      showToast(err.message || "Failed to initiate top up", "error");
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <section className="min-h-screen py-16 px-4 relative">
      

      {/* Content wrapper */}
      <div className="relative z-10">
        {!isAdminRoute && (
          <div className="fixed top-6 left-6 z-40">
            <img src='/src/assets/logo-white.png' alt="BlogSpeed Logo" className="h-8 w-auto" />
          </div>
        )}



      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
            toast.type === "error"
              ? "bg-red-500/20 border-red-500/30 text-red-200"
              : "bg-green-500/20 border-green-500/30 text-green-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Top Up Credits
        </h1>
        <p className="text-lg text-white/60">
          Buy credits and unlock premium AI workflows on demand.
        </p>
      </div>

      {currentAccount && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-wide text-white/50">Current balance</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-semibold text-white">
                {currentAccount.creditBalance || 0}
              </span>
              <span className="text-sm text-white/50">credits available</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {creditPlans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative group rounded-2xl border p-8 transition-all duration-500 ${
                plan.highlight
                  ? "bg-black border-white/20"
                  : "bg-black border-white/10 hover:border-white/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20 backdrop-blur-xl">
                    <Zap className="w-3 h-3" />
                    Best Value
                  </span>
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-white/10 ${
                  plan.highlight
                    ? "bg-white/10"
                    : "bg-white/5"
                }`}
              >
                <Icon className={`w-7 h-7 ${plan.highlight ? "text-white" : "text-white/70"}`} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-white/60 mb-4">
                {plan.credits} credits per top-up
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                <span className="text-white/50 text-sm">one-time</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 border border-white/10 ${
                        plan.highlight
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-white/60"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-white/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgrading === plan.id}
                variant={plan.highlight ? "primary" : "secondary"}
                size="lg"
                className={`w-full ${
                  plan.highlight
                    ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                }`}
              >
                {upgrading === plan.id ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Top Up Credits"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto mt-20 text-center">
        <p className="text-white/40 text-sm">
          Credits never expire. Use them whenever you need premium AI features.
        </p>
      </div>

      {!isAdminRoute && (
        <div className="fixed bottom-6 left-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            BACK TO SITE
          </a>
        </div>
      )}
      </div>
    </section>
  );
}
