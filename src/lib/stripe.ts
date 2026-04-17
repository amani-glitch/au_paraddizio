import StripeSDK from "stripe";

let _stripe: StripeSDK | null = null;

export function getStripe(): StripeSDK | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_..." || key.length < 10) {
    return null;
  }
  _stripe = new StripeSDK(key);
  return _stripe;
}
