import Razorpay from "razorpay";

let _instance = null;

function getRazorpay() {
  if (_instance) return _instance;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  _instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _instance;
}

// Export a proxy so the app can start without Razorpay; methods throw if used without config
const razorpay = new Proxy(
  {},
  {
    get(_, prop) {
      return getRazorpay()[prop];
    }
  }
);

export default razorpay;
