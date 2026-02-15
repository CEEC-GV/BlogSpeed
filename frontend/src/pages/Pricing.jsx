import { useState } from "react";
import { useUser } from "../context/UserContext";
import api from "../api/axios";
import Button from "../components/Button";
import Loader from "../components/Loader";

const CREDIT_PLANS = [
  {
    id: "credits_70",
    credits: 70,
    amount: 499,
    name: "Starter Pack",
    description: "Perfect for small projects",
    features: ["70 AI generations", "SEO optimization", "Content analysis"],
    popular: false
  },
  {
    id: "credits_150",
    credits: 150,
    amount: 999,
    name: "Pro Pack",
    description: "Best value for regular users",
    features: ["150 AI generations", "SEO optimization", "Content analysis", "Priority support"],
    popular: true
  }
];

export default function Pricing() {
  const { user, refreshCredits, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);
      setError("");

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway");
        return;
      }

      // Create order
      const orderResponse = await api.post("/subscriptions/create-order", {
        creditPlanId: plan.id
      });

      console.log("[Razorpay] create-order response:", orderResponse?.data);

      const order = orderResponse?.data?.order;
      const orderId = order?.id || orderResponse?.data?.orderId;
      const orderAmount = order?.amount ?? orderResponse?.data?.amount;
      const orderCurrency = order?.currency || orderResponse?.data?.currency;

      if (!orderId || !orderAmount || !orderCurrency) {
        console.error("[Razorpay] Missing order fields", {
          orderId,
          orderAmount,
          orderCurrency
        });
        setError("Invalid order response from server");
        return;
      }

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: orderCurrency,
        name: "BlogSpeed",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: orderId,
        handler: async (response) => {
          try {
            console.log("[Razorpay] checkout handler response:", response);
            // Verify payment
            const verifyResponse = await api.post("/subscriptions/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              creditPlanId: plan.id
            });

            console.log("[Razorpay] verify-payment response:", verifyResponse?.data);

            if (verifyResponse.data.success) {
              // Refresh credits
              await refreshCredits();
              alert(`Success! ${plan.credits} credits added to your account.`);
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            setError("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || ""
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError(err.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  // Loading guard
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black relative">
      {/* Dotted background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Top Up Credits
          </h1>
          <p className="text-sm md:text-base text-white/60">
            Buy credits and unlock premium AI workflows on demand.
          </p>
        </div>

        {/* CurrentBalanceCard */}
        {user && (
          <div className="mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-6">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Current Balance
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-4xl md:text-5xl font-semibold text-white">
                  {user?.creditBalance ?? 0}
                </p>
                <p className="text-sm text-white/50">credits available</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl backdrop-blur-xl">
            {error}
          </div>
        )}

        {/* Credit cards grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {CREDIT_PLANS.map((plan) => {
            const isBestValue = Boolean(plan.popular);
            const isPro = plan.credits === 150;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${
                  isPro
                    ? "border-white/20 bg-white/8"
                    : "border-white/10 bg-white/5"
                }`}
              >
              {isBestValue && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-white/10 text-white rounded-full px-3 py-1 text-xs font-semibold border border-white/20 backdrop-blur-xl">
                    Best Value
                  </div>
                </div>
              )}

              <div className="p-6">
                  {/* Icon container (top-left) */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center border border-white/10 ${
                        isPro ? "bg-white/10" : "bg-white/5"
                      }`}
                    >
                      {isPro ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                        >
                          <path
                            d="M5 8l3 4 4-7 4 7 3-4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                        >
                          <path
                            d="M13 2L3 14h7l-1 8 12-14h-7l-1-6z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Credits + price */}
                  <div className="mt-6">
                    <h3 className="text-3xl md:text-4xl font-semibold text-white">
                      {plan.credits} Credits
                    </h3>
                    <p className="mt-2 text-sm text-white/60">{plan.credits} credits per top-up</p>

                    <div className="mt-6 flex items-baseline gap-3">
                      <span className="text-4xl md:text-5xl font-semibold text-white">
                        ₹{plan.amount}
                      </span>
                      <span className="text-sm text-white/60">one-time</span>
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-white/80">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 border border-white/10">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-10">
                    <Button
                      onClick={() => handleUpgrade(plan)}
                      disabled={loading}
                      className={`w-full py-3 text-sm md:text-base font-semibold rounded-lg transition-all ${
                        isPro
                          ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          : "bg-white/5 hover:bg-white/10 text-white/90 border border-white/10"
                      }`}
                    >
                      {loading ? <Loader size="sm" /> : "Top Up Credits"}
                    </Button>
                  </div>
              </div>
            </div>
          );
        })}

        <p className="text-center text-xs text-white/40 mt-8">
          Credits never expire. Use them whenever you need premium AI features.
        </p>
      </div>
    </div>
    </div>
  );
}
