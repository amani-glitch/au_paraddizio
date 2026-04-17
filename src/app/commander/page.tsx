"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  Lock,
  Mail,
  Phone,
  User,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  ShieldCheck,
  AlertCircle,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderMode, StoreInfo, DeliveryZone } from "@/types";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface DeliveryForm {
  street: string;
  complement: string;
  postalCode: string;
  city: string;
  instructions: string;
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type PaymentMethod = "card" | "meal_voucher" | "paypal" | "on_site";

interface CardForm {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// ─── Validation helpers ─────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s().-]{6,20}$/;
const POSTAL_REGEX = /^\d{5}$/;

function isValidEmail(v: string) {
  return EMAIL_REGEX.test(v.trim());
}
function isValidPhone(v: string) {
  return PHONE_REGEX.test(v.replace(/\s/g, ""));
}
function isValidPostal(v: string) {
  return POSTAL_REGEX.test(v.trim());
}

function isInDeliveryZone(postalCode: string, zones: DeliveryZone[]): boolean {
  const allCodes = zones.flatMap((z) => z.postalCodes);
  return allCodes.includes(postalCode.trim());
}

// ─── Time slot generator ────────────────────────────────────────────────────────

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  const startHour = 17;
  const startMin = 30;
  const endHour = 21;
  const endMin = 30;

  // Round current time up to next 15-min slot
  let h = now.getHours();
  let m = now.getMinutes();
  m = Math.ceil(m / 15) * 15;
  if (m >= 60) {
    h += 1;
    m = 0;
  }
  // Make sure we start at opening time at earliest
  if (h < startHour || (h === startHour && m < startMin)) {
    h = startHour;
    m = startMin;
  }
  // Add a 20-min preparation buffer
  m += 20;
  if (m >= 60) {
    h += 1;
    m -= 60;
  }
  // Round to next 15-min
  m = Math.ceil(m / 15) * 15;
  if (m >= 60) {
    h += 1;
    m = 0;
  }

  while (h < endHour || (h === endHour && m <= endMin)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 15;
    if (m >= 60) {
      h += 1;
      m = 0;
    }
  }
  return slots;
}

// ─── Step indicator ─────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Mode de retrait",
  "Informations",
  "Identification",
  "Paiement",
  "Confirmation",
];

function StepIndicator({ current, completed }: { current: number; completed: number[] }) {
  return (
    <nav aria-label="Progression de la commande" className="w-full">
      <ol className="flex items-center justify-between">
        {STEP_LABELS.map((label, idx) => {
          const step = idx + 1;
          const isCompleted = completed.includes(step);
          const isCurrent = step === current;
          const isUpcoming = step > current;

          return (
            <li key={step} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={cn(
                    "absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2",
                    isCompleted || isCurrent ? "bg-secondary" : "bg-wood/15"
                  )}
                  style={{ zIndex: 0 }}
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-secondary border-secondary text-white"
                    : isCurrent
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                    : "bg-white border-wood/20 text-wood/40"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center leading-tight hidden sm:block",
                  isCurrent
                    ? "text-primary font-semibold"
                    : isCompleted
                    ? "text-secondary"
                    : "text-wood/40"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Page animation wrapper ─────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN CHECKOUT PAGE
// ═════════════════════════════════════════════════════════════════════════════════

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore();
  const auth = useAuthStore();

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [storeLoading, setStoreLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store")
      .then(r => r.json())
      .then((data) => {
        setStoreInfo(data);
        setDeliveryZones(data.deliveryZones ?? []);
      })
      .finally(() => setStoreLoading(false));
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Step 1 state
  const [selectedMode, setSelectedMode] = useState<OrderMode>(cart.orderMode);

  // Step 2 state
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    street: "",
    complement: "",
    postalCode: "",
    city: "",
    instructions: "",
  });
  const [pickupTime, setPickupTime] = useState("asap");
  const [guestCount, setGuestCount] = useState(2);
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Step 3 state
  const [authTab, setAuthTab] = useState<"login" | "register" | "guest">("guest");
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", email: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  // Step 4 state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardForm, setCardForm] = useState<CardForm>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [step4Errors, setStep4Errors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 5 state
  const [orderNumber, setOrderNumber] = useState("");
  const [orderPlacedAt, setOrderPlacedAt] = useState<Date | null>(null);

  // Memos
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Redirect if cart is empty (but not on confirmation step)
  useEffect(() => {
    if (cart.items.length === 0 && currentStep < 5) {
      router.push("/menu");
    }
  }, [cart.items.length, currentStep, router]);

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 5));
  }, [currentStep]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  // ─── Step 1: Mode de retrait ──────────────────────────────────────────────────

  const handleModeSelect = (mode: OrderMode) => {
    setSelectedMode(mode);
    cart.setOrderMode(mode);
  };

  const handleStep1Continue = () => {
    goNext();
  };

  // ─── Step 2: Informations ─────────────────────────────────────────────────────

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (selectedMode === "DELIVERY") {
      if (!deliveryForm.street.trim()) errors.street = "Adresse requise";
      if (!deliveryForm.postalCode.trim()) {
        errors.postalCode = "Code postal requis";
      } else if (!isValidPostal(deliveryForm.postalCode)) {
        errors.postalCode = "Code postal invalide";
      } else if (!isInDeliveryZone(deliveryForm.postalCode, deliveryZones)) {
        errors.postalCode = "Hors zone de livraison";
      }
      if (!deliveryForm.city.trim()) errors.city = "Ville requise";
    }

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep2Continue = () => {
    if (validateStep2()) {
      if (selectedMode === "DELIVERY") {
        cart.setDeliveryAddress({
          id: "checkout-address",
          label: "Adresse de livraison",
          street: deliveryForm.street,
          city: deliveryForm.city,
          postalCode: deliveryForm.postalCode,
          instructions: deliveryForm.instructions,
          isDefault: false,
        });
      }
      goNext();
    }
  };

  // ─── Step 3: Identification ───────────────────────────────────────────────────

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (authTab === "login") {
      if (!isValidEmail(loginForm.email)) errors.loginEmail = "Email invalide";
      if (!loginForm.password) errors.loginPassword = "Mot de passe requis";
    } else if (authTab === "register") {
      if (!registerForm.name.trim()) errors.registerName = "Nom requis";
      if (!isValidEmail(registerForm.email)) errors.registerEmail = "Email invalide";
      if (!isValidPhone(registerForm.phone)) errors.registerPhone = "Numéro de téléphone invalide";
      if (registerForm.password.length < 6) errors.registerPassword = "6 caractères minimum";
    } else {
      if (!guestInfo.name.trim()) errors.guestName = "Nom requis";
      if (!isValidEmail(guestInfo.email)) errors.guestEmail = "Email invalide";
      if (!isValidPhone(guestInfo.phone)) errors.guestPhone = "Numéro de téléphone invalide";
    }

    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep3Continue = () => {
    if (validateStep3()) {
      // Simulate setting user info
      if (authTab === "login") {
        auth.setUser({
          id: "user-1",
          email: loginForm.email,
          name: loginForm.email.split("@")[0],
          role: "CUSTOMER",
          loyaltyPoints: 0,
          addresses: [],
        });
      } else if (authTab === "register") {
        auth.setUser({
          id: "user-new",
          email: registerForm.email,
          name: registerForm.name,
          phone: registerForm.phone,
          role: "CUSTOMER",
          loyaltyPoints: 0,
          addresses: [],
        });
      }
      goNext();
    }
  };

  // ─── Step 4: Paiement ─────────────────────────────────────────────────────────

  const validateStep4 = (): boolean => {
    const errors: Record<string, string> = {};

    if (paymentMethod === "card") {
      if (cardForm.number.replace(/\s/g, "").length < 16) errors.cardNumber = "Numéro de carte invalide";
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(cardForm.expiry.trim())) errors.cardExpiry = "Date invalide (MM/AA)";
      if (cardForm.cvc.length < 3) errors.cardCvc = "CVC invalide";
      if (!cardForm.name.trim()) errors.cardName = "Nom sur la carte requis";
    }

    if (!acceptCGV) errors.cgv = "Vous devez accepter les CGV";

    setStep4Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateStep4()) return;

    setIsProcessing(true);

    try {
      // Build customerInfo from auth user or guest/register form
      let customerInfo: { name: string; phone: string; email: string };
      if (auth.isAuthenticated && auth.user) {
        customerInfo = {
          name: auth.user.name,
          phone: auth.user.phone ?? guestInfo.phone,
          email: auth.user.email,
        };
      } else if (authTab === "guest") {
        customerInfo = {
          name: guestInfo.name,
          phone: guestInfo.phone,
          email: guestInfo.email,
        };
      } else if (authTab === "register") {
        customerInfo = {
          name: registerForm.name,
          phone: registerForm.phone,
          email: registerForm.email,
        };
      } else {
        customerInfo = {
          name: loginForm.email.split("@")[0],
          phone: guestInfo.phone || "",
          email: loginForm.email,
        };
      }

      // Transform cart items to API format
      const apiItems = cart.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        sizeName: item.size.name,
        sizePrice: item.size.price,
        quantity: item.quantity,
        supplements: item.supplements.map((s) => ({ name: s.name, price: s.price })),
        removedIngredients: item.removedIngredients,
        specialInstructions: item.specialInstructions || undefined,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }));

      // Build delivery address string
      const deliveryAddress =
        selectedMode === "DELIVERY"
          ? {
              street: deliveryForm.street,
              complement: deliveryForm.complement,
              postalCode: deliveryForm.postalCode,
              city: deliveryForm.city,
              instructions: deliveryForm.instructions,
            }
          : undefined;

      // Use the checkout API which handles both Stripe and cash payments
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: apiItems,
          mode: selectedMode,
          deliveryAddress,
          customerInfo,
          paymentMethod,
          promoCode: cart.promoCode || undefined,
          notes: deliveryForm.instructions || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(data.error || `Erreur ${res.status}`);
      }

      const result = await res.json();

      // For card payments, redirect to Stripe Checkout
      if (result.checkoutUrl) {
        cart.clearCart();
        window.location.href = result.checkoutUrl;
        return;
      }

      // For cash/on-site payments, show confirmation directly
      setOrderNumber(result.orderNumber);
      setOrderPlacedAt(new Date());
      setIsProcessing(false);
      goNext();
      cart.clearCart();
      toast.success("Commande confirmée !");
    } catch (error) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(message);
    }
  };

  // ─── Helper: get user email for confirmation ─────────────────────────────────

  const getUserEmail = (): string => {
    if (auth.user?.email) return auth.user.email;
    if (authTab === "guest") return guestInfo.email;
    if (authTab === "login") return loginForm.email;
    if (authTab === "register") return registerForm.email;
    return "";
  };

  // ─── Estimated time ───────────────────────────────────────────────────────────

  const getEstimatedTime = (): string => {
    if (selectedMode === "DELIVERY") {
      const zone = deliveryZones.find((z) => z.postalCodes.includes(deliveryForm.postalCode.trim()));
      return zone ? `${zone.estimatedMinutes} minutes` : "30-45 minutes";
    }
    if (selectedMode === "TAKEAWAY") {
      if (pickupTime === "asap") return "environ 20 minutes";
      return `à ${pickupTime}`;
    }
    return "dès votre arrivée";
  };

  // ─── Format card number with spaces ───────────────────────────────────────────

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return digits;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  if (cart.items.length === 0 && currentStep < 5) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-wood/10 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/menu"
              className="text-wood hover:text-primary transition-colors text-sm font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au menu
            </Link>
            <h1 className="font-heading text-xl font-bold text-wood">Commander</h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
          <StepIndicator current={currentStep} completed={completedSteps} />
        </div>
      </div>

      {/* ─── Step content ────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* ═══════════════════════════════════════════════════════════════════
                STEP 1 — MODE DE RETRAIT
                ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-2">
                    Comment souhaitez-vous récupérer votre commande ?
                  </h2>
                  <p className="text-wood-light">
                    Choisissez votre mode de retrait préféré
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-10">
                  {/* Livraison */}
                  <button
                    onClick={() => handleModeSelect("DELIVERY")}
                    className={cn(
                      "relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 group",
                      selectedMode === "DELIVERY"
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-wood/10 bg-white hover:border-primary/30 hover:shadow-md"
                    )}
                  >
                    {selectedMode === "DELIVERY" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        selectedMode === "DELIVERY" ? "bg-primary/10" : "bg-wood/5 group-hover:bg-primary/5"
                      )}
                    >
                      <Truck
                        className={cn(
                          "w-8 h-8 transition-colors",
                          selectedMode === "DELIVERY" ? "text-primary" : "text-wood/50 group-hover:text-primary/70"
                        )}
                      />
                    </div>
                    <h3 className="font-heading font-bold text-wood text-lg mb-1">Livraison</h3>
                    <p className="text-sm text-wood-light mb-3">
                      Recevez votre commande directement chez vous
                    </p>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Frais : {formatPrice(cart.deliveryFee())}
                    </span>
                  </button>

                  {/* A emporter */}
                  <button
                    onClick={() => handleModeSelect("TAKEAWAY")}
                    className={cn(
                      "relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 group",
                      selectedMode === "TAKEAWAY"
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-wood/10 bg-white hover:border-primary/30 hover:shadow-md"
                    )}
                  >
                    {selectedMode === "TAKEAWAY" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        selectedMode === "TAKEAWAY" ? "bg-primary/10" : "bg-wood/5 group-hover:bg-primary/5"
                      )}
                    >
                      <ShoppingBag
                        className={cn(
                          "w-8 h-8 transition-colors",
                          selectedMode === "TAKEAWAY" ? "text-primary" : "text-wood/50 group-hover:text-primary/70"
                        )}
                      />
                    </div>
                    <h3 className="font-heading font-bold text-wood text-lg mb-1">À emporter</h3>
                    <p className="text-sm text-wood-light mb-3">
                      Récupérez votre commande au restaurant
                    </p>
                    <span className="text-xs font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                      Gratuit
                    </span>
                  </button>

                  {/* Sur place */}
                  <button
                    onClick={() => handleModeSelect("DINE_IN")}
                    className={cn(
                      "relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 group",
                      selectedMode === "DINE_IN"
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-wood/10 bg-white hover:border-primary/30 hover:shadow-md"
                    )}
                  >
                    {selectedMode === "DINE_IN" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        selectedMode === "DINE_IN" ? "bg-primary/10" : "bg-wood/5 group-hover:bg-primary/5"
                      )}
                    >
                      <UtensilsCrossed
                        className={cn(
                          "w-8 h-8 transition-colors",
                          selectedMode === "DINE_IN" ? "text-primary" : "text-wood/50 group-hover:text-primary/70"
                        )}
                      />
                    </div>
                    <h3 className="font-heading font-bold text-wood text-lg mb-1">Sur place</h3>
                    <p className="text-sm text-wood-light mb-3">
                      Savourez votre repas dans notre restaurant
                    </p>
                    <span className="text-xs font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                      Gratuit
                    </span>
                  </button>
                </div>

                {/* Continue button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleStep1Continue}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Continuer
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 2 — INFORMATIONS
                ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-2">
                    {selectedMode === "DELIVERY"
                      ? "Adresse de livraison"
                      : selectedMode === "TAKEAWAY"
                      ? "Retrait au restaurant"
                      : "Réservation sur place"}
                  </h2>
                </div>

                <div className="max-w-2xl mx-auto">
                  {/* ── DELIVERY MODE ──────────────────────────────────────────── */}
                  {selectedMode === "DELIVERY" && (
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-wood/5">
                      <div className="space-y-5">
                        {/* Street */}
                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Rue <span className="text-primary">*</span>
                          </label>
                          <input
                            type="text"
                            value={deliveryForm.street}
                            onChange={(e) => {
                              setDeliveryForm({ ...deliveryForm, street: e.target.value });
                              setStep2Errors((prev) => ({ ...prev, street: "" }));
                            }}
                            placeholder="123 Avenue de la Liberté"
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                              step2Errors.street
                                ? "border-primary/50 focus:ring-primary/30"
                                : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                            )}
                          />
                          {step2Errors.street && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step2Errors.street}
                            </p>
                          )}
                        </div>

                        {/* Complement */}
                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Complément d&apos;adresse
                          </label>
                          <input
                            type="text"
                            value={deliveryForm.complement}
                            onChange={(e) =>
                              setDeliveryForm({ ...deliveryForm, complement: e.target.value })
                            }
                            placeholder="Bâtiment, étage, appartement..."
                            className="w-full px-4 py-3 rounded-xl border border-wood/15 bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                          />
                        </div>

                        {/* Postal Code + City row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-wood mb-1.5">
                              Code postal <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={5}
                              value={deliveryForm.postalCode}
                              onChange={(e) => {
                                setDeliveryForm({
                                  ...deliveryForm,
                                  postalCode: e.target.value.replace(/\D/g, ""),
                                });
                                setStep2Errors((prev) => ({ ...prev, postalCode: "" }));
                              }}
                              placeholder="84320"
                              className={cn(
                                "w-full px-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step2Errors.postalCode
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                            {step2Errors.postalCode && (
                              <p className="mt-1 text-xs text-primary flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {step2Errors.postalCode}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-wood mb-1.5">
                              Ville <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              value={deliveryForm.city}
                              onChange={(e) => {
                                setDeliveryForm({ ...deliveryForm, city: e.target.value });
                                setStep2Errors((prev) => ({ ...prev, city: "" }));
                              }}
                              placeholder="Entraigues-sur-la-Sorgue"
                              className={cn(
                                "w-full px-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step2Errors.city
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                            {step2Errors.city && (
                              <p className="mt-1 text-xs text-primary flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {step2Errors.city}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Instructions */}
                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Instructions de livraison
                          </label>
                          <textarea
                            value={deliveryForm.instructions}
                            onChange={(e) =>
                              setDeliveryForm({ ...deliveryForm, instructions: e.target.value })
                            }
                            rows={3}
                            placeholder="Code porte, étage, digicode, sonnez chez..."
                            className="w-full px-4 py-3 rounded-xl border border-wood/15 bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                          />
                        </div>
                      </div>

                      {/* Delivery info banner */}
                      <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                        <Truck className="w-5 h-5 text-secondary flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-semibold text-secondary">
                            Frais de livraison : {formatPrice(cart.deliveryFee())}
                          </span>
                          <span className="text-wood-light ml-2">
                            &middot; Estimé {getEstimatedTime()}
                          </span>
                        </div>
                      </div>

                      {/* Delivery zone info */}
                      <div className="mt-3 p-3 rounded-lg bg-cream/80 border border-wood/5">
                        <p className="text-xs text-wood-light">
                          <strong>Zones desservies :</strong> Entraigues-sur-la-Sorgue (84320),
                          Monteux (84170), Le Pontet (84130), Avignon (84000)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── TAKEAWAY MODE ──────────────────────────────────────────── */}
                  {selectedMode === "TAKEAWAY" && (
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-wood/5">
                      {/* Pickup address */}
                      <div className="flex items-start gap-4 mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-wood mb-1">
                            Adresse de retrait
                          </h3>
                          <p className="text-wood-light text-sm">{storeInfo?.address}</p>
                          <a
                            href={`tel:${storeInfo?.phone.replace(/\s/g, "") ?? ""}`}
                            className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1 hover:text-primary-dark transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {storeInfo?.phone}
                          </a>
                        </div>
                      </div>

                      {/* Time slot */}
                      <div>
                        <h3 className="font-heading font-semibold text-wood mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-accent" />
                          Heure de retrait
                        </h3>
                        <div className="space-y-3">
                          {/* ASAP option */}
                          <label
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              pickupTime === "asap"
                                ? "border-primary bg-primary/5"
                                : "border-wood/10 hover:border-primary/20"
                            )}
                          >
                            <input
                              type="radio"
                              name="pickupTime"
                              checked={pickupTime === "asap"}
                              onChange={() => setPickupTime("asap")}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                pickupTime === "asap" ? "border-primary" : "border-wood/30"
                              )}
                            >
                              {pickupTime === "asap" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-wood">
                                Dès que possible
                              </span>
                              <span className="text-sm text-wood-light ml-2">(environ 20 min)</span>
                            </div>
                          </label>

                          {/* Specific time slots */}
                          <div>
                            <label
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                pickupTime !== "asap"
                                  ? "border-primary bg-primary/5"
                                  : "border-wood/10 hover:border-primary/20"
                              )}
                            >
                              <input
                                type="radio"
                                name="pickupTime"
                                checked={pickupTime !== "asap"}
                                onChange={() => setPickupTime(timeSlots[0] || "18:00")}
                                className="sr-only"
                              />
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                  pickupTime !== "asap" ? "border-primary" : "border-wood/30"
                                )}
                              >
                                {pickupTime !== "asap" && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                )}
                              </div>
                              <span className="font-semibold text-wood">Choisir un créneau</span>
                            </label>

                            {pickupTime !== "asap" && (
                              <div className="mt-3 ml-8 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    onClick={() => setPickupTime(slot)}
                                    className={cn(
                                      "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                                      pickupTime === slot
                                        ? "bg-primary text-white border-primary shadow-sm"
                                        : "bg-cream/80 text-wood border-wood/10 hover:border-primary/30"
                                    )}
                                  >
                                    {slot}
                                  </button>
                                ))}
                                {timeSlots.length === 0 && (
                                  <p className="col-span-full text-sm text-wood-light italic">
                                    Aucun créneau disponible pour aujourd&apos;hui
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── DINE_IN MODE ───────────────────────────────────────────── */}
                  {selectedMode === "DINE_IN" && (
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-wood/5">
                      {/* Restaurant info */}
                      <div className="flex items-start gap-4 mb-8 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UtensilsCrossed className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-wood mb-1">
                            Veuillez vous présenter au restaurant
                          </h3>
                          <p className="text-wood-light text-sm">{storeInfo?.address}</p>
                        </div>
                      </div>

                      {/* Number of guests */}
                      <div>
                        <h3 className="font-heading font-semibold text-wood mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-accent" />
                          Nombre de convives
                        </h3>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            className="w-10 h-10 rounded-full border-2 border-wood/15 flex items-center justify-center text-wood hover:border-primary/30 hover:text-primary transition-all text-lg font-bold"
                          >
                            -
                          </button>
                          <span className="text-2xl font-bold text-wood w-10 text-center">
                            {guestCount}
                          </span>
                          <button
                            onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                            className="w-10 h-10 rounded-full border-2 border-wood/15 flex items-center justify-center text-wood hover:border-primary/30 hover:text-primary transition-all text-lg font-bold"
                          >
                            +
                          </button>
                          <span className="text-sm text-wood-light">
                            {guestCount === 1 ? "personne" : "personnes"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 text-wood hover:text-primary font-semibold px-6 py-3 rounded-full border-2 border-wood/15 hover:border-primary/30 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Retour
                    </button>
                    <button
                      onClick={handleStep2Continue}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continuer
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 3 — IDENTIFICATION
                ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-2">
                    Vos coordonnées
                  </h2>
                  <p className="text-wood-light">
                    Identifiez-vous ou commandez en tant qu&apos;invité
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  {/* Tab navigation */}
                  <div className="flex rounded-xl bg-white border border-wood/10 p-1 mb-6 shadow-sm">
                    {(
                      [
                        { key: "guest", label: "Commander en invité" },
                        { key: "login", label: "Se connecter" },
                        { key: "register", label: "Créer un compte" },
                      ] as const
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setAuthTab(key);
                          setStep3Errors({});
                        }}
                        className={cn(
                          "flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all",
                          authTab === key
                            ? "bg-primary text-white shadow-md"
                            : "text-wood/60 hover:text-wood hover:bg-cream/50"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-wood/5">
                    {/* ── Guest form ──────────────────────────────────────────── */}
                    {authTab === "guest" && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                          <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0" />
                          <p className="text-sm text-wood-light">
                            Pas besoin de compte ! Renseignez simplement vos coordonnées.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Nom complet <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="text"
                              value={guestInfo.name}
                              onChange={(e) => {
                                setGuestInfo({ ...guestInfo, name: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, guestName: "" }));
                              }}
                              placeholder="Jean Dupont"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.guestName
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.guestName && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.guestName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Email <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="email"
                              value={guestInfo.email}
                              onChange={(e) => {
                                setGuestInfo({ ...guestInfo, email: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, guestEmail: "" }));
                              }}
                              placeholder="jean@exemple.fr"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.guestEmail
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.guestEmail && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.guestEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Téléphone <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="tel"
                              value={guestInfo.phone}
                              onChange={(e) => {
                                setGuestInfo({ ...guestInfo, phone: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, guestPhone: "" }));
                              }}
                              placeholder="06 12 34 56 78"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.guestPhone
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.guestPhone && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.guestPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Login form ──────────────────────────────────────────── */}
                    {authTab === "login" && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Email <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="email"
                              value={loginForm.email}
                              onChange={(e) => {
                                setLoginForm({ ...loginForm, email: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, loginEmail: "" }));
                              }}
                              placeholder="jean@exemple.fr"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.loginEmail
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.loginEmail && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.loginEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Mot de passe <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={loginForm.password}
                              onChange={(e) => {
                                setLoginForm({ ...loginForm, password: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, loginPassword: "" }));
                              }}
                              placeholder="••••••••"
                              className={cn(
                                "w-full pl-11 pr-12 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.loginPassword
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wood/40 hover:text-wood transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4.5 h-4.5" />
                              ) : (
                                <Eye className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </div>
                          {step3Errors.loginPassword && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.loginPassword}
                            </p>
                          )}
                        </div>

                        <button className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                          Mot de passe oublié ?
                        </button>
                      </div>
                    )}

                    {/* ── Register form ───────────────────────────────────────── */}
                    {authTab === "register" && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Nom complet <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="text"
                              value={registerForm.name}
                              onChange={(e) => {
                                setRegisterForm({ ...registerForm, name: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, registerName: "" }));
                              }}
                              placeholder="Jean Dupont"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.registerName
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.registerName && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.registerName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Email <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="email"
                              value={registerForm.email}
                              onChange={(e) => {
                                setRegisterForm({ ...registerForm, email: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, registerEmail: "" }));
                              }}
                              placeholder="jean@exemple.fr"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.registerEmail
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.registerEmail && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.registerEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Téléphone <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type="tel"
                              value={registerForm.phone}
                              onChange={(e) => {
                                setRegisterForm({ ...registerForm, phone: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, registerPhone: "" }));
                              }}
                              placeholder="06 12 34 56 78"
                              className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.registerPhone
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                          </div>
                          {step3Errors.registerPhone && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.registerPhone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-wood mb-1.5">
                            Mot de passe <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={registerForm.password}
                              onChange={(e) => {
                                setRegisterForm({ ...registerForm, password: e.target.value });
                                setStep3Errors((prev) => ({ ...prev, registerPassword: "" }));
                              }}
                              placeholder="6 caractères minimum"
                              className={cn(
                                "w-full pl-11 pr-12 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all",
                                step3Errors.registerPassword
                                  ? "border-primary/50 focus:ring-primary/30"
                                  : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wood/40 hover:text-wood transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4.5 h-4.5" />
                              ) : (
                                <Eye className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </div>
                          {step3Errors.registerPassword && (
                            <p className="mt-1 text-xs text-primary flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {step3Errors.registerPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 text-wood hover:text-primary font-semibold px-6 py-3 rounded-full border-2 border-wood/15 hover:border-primary/30 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Retour
                    </button>
                    <button
                      onClick={handleStep3Continue}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continuer
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 4 — PAIEMENT
                ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-2">
                    Paiement
                  </h2>
                  <p className="text-wood-light">
                    Vérifiez votre commande et choisissez votre mode de paiement
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* ── Left: Payment methods (3 cols) ─────────────────────── */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* Payment method selection */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5">
                        <h3 className="font-heading font-semibold text-wood mb-4">
                          Mode de paiement
                        </h3>

                        <div className="space-y-3">
                          {/* Card */}
                          <label
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === "card"
                                ? "border-primary bg-primary/5"
                                : "border-wood/10 hover:border-primary/20"
                            )}
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === "card"}
                              onChange={() => setPaymentMethod("card")}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                paymentMethod === "card" ? "border-primary" : "border-wood/30"
                              )}
                            >
                              {paymentMethod === "card" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <CreditCard className="w-5 h-5 text-wood/60" />
                            <div className="flex-1">
                              <span className="font-semibold text-wood">Carte bancaire</span>
                              <span className="text-xs text-wood-light ml-2">CB / Visa / Mastercard</span>
                            </div>
                          </label>

                          {/* Meal vouchers */}
                          <label
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === "meal_voucher"
                                ? "border-primary bg-primary/5"
                                : "border-wood/10 hover:border-primary/20"
                            )}
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === "meal_voucher"}
                              onChange={() => setPaymentMethod("meal_voucher")}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                paymentMethod === "meal_voucher" ? "border-primary" : "border-wood/30"
                              )}
                            >
                              {paymentMethod === "meal_voucher" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <Wallet className="w-5 h-5 text-wood/60" />
                            <div className="flex-1">
                              <span className="font-semibold text-wood">Titres-restaurant</span>
                              <span className="text-xs text-wood-light block">
                                Edenred, Swile, Pluxee
                              </span>
                            </div>
                          </label>
                          {paymentMethod === "meal_voucher" && (
                            <div className="ml-8 p-3 rounded-lg bg-accent/5 border border-accent/10">
                              <p className="text-xs text-wood-light flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                Plafond journalier de 25,00 \u20ac par titre-restaurant. Le complément
                                sera à régler par un autre moyen de paiement.
                              </p>
                            </div>
                          )}

                          {/* PayPal */}
                          <label
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === "paypal"
                                ? "border-primary bg-primary/5"
                                : "border-wood/10 hover:border-primary/20"
                            )}
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === "paypal"}
                              onChange={() => setPaymentMethod("paypal")}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                paymentMethod === "paypal" ? "border-primary" : "border-wood/30"
                              )}
                            >
                              {paymentMethod === "paypal" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-blue-600 font-bold text-sm">Pay</span>
                            <div className="flex-1">
                              <span className="font-semibold text-wood">PayPal</span>
                            </div>
                          </label>

                          {/* On-site payment */}
                          <label
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === "on_site"
                                ? "border-primary bg-primary/5"
                                : "border-wood/10 hover:border-primary/20"
                            )}
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === "on_site"}
                              onChange={() => setPaymentMethod("on_site")}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                paymentMethod === "on_site" ? "border-primary" : "border-wood/30"
                              )}
                            >
                              {paymentMethod === "on_site" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <Banknote className="w-5 h-5 text-wood/60" />
                            <div className="flex-1">
                              <span className="font-semibold text-wood">
                                {selectedMode === "DELIVERY"
                                  ? "Paiement à la livraison"
                                  : "Paiement au retrait"}
                              </span>
                              <span className="text-xs text-wood-light block">
                                Espèces ou CB
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Card form (only if card selected) */}
                      {paymentMethod === "card" && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5">
                          <h3 className="font-heading font-semibold text-wood mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-secondary" />
                            Informations de carte
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-wood mb-1.5">
                                Numéro de carte <span className="text-primary">*</span>
                              </label>
                              <div className="relative">
                                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-wood/30" />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={cardForm.number}
                                  onChange={(e) => {
                                    setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) });
                                    setStep4Errors((prev) => ({ ...prev, cardNumber: "" }));
                                  }}
                                  placeholder="1234 5678 9012 3456"
                                  maxLength={19}
                                  className={cn(
                                    "w-full pl-11 pr-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all font-mono tracking-wider",
                                    step4Errors.cardNumber
                                      ? "border-primary/50 focus:ring-primary/30"
                                      : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                                  )}
                                />
                              </div>
                              {step4Errors.cardNumber && (
                                <p className="mt-1 text-xs text-primary flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {step4Errors.cardNumber}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-wood mb-1.5">
                                  Expiration <span className="text-primary">*</span>
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={cardForm.expiry}
                                  onChange={(e) => {
                                    setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) });
                                    setStep4Errors((prev) => ({ ...prev, cardExpiry: "" }));
                                  }}
                                  placeholder="MM / AA"
                                  maxLength={7}
                                  className={cn(
                                    "w-full px-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all font-mono text-center",
                                    step4Errors.cardExpiry
                                      ? "border-primary/50 focus:ring-primary/30"
                                      : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                                  )}
                                />
                                {step4Errors.cardExpiry && (
                                  <p className="mt-1 text-xs text-primary flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {step4Errors.cardExpiry}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-wood mb-1.5">
                                  CVC <span className="text-primary">*</span>
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={cardForm.cvc}
                                  onChange={(e) => {
                                    setCardForm({
                                      ...cardForm,
                                      cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                                    });
                                    setStep4Errors((prev) => ({ ...prev, cardCvc: "" }));
                                  }}
                                  placeholder="123"
                                  maxLength={4}
                                  className={cn(
                                    "w-full px-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all font-mono text-center",
                                    step4Errors.cardCvc
                                      ? "border-primary/50 focus:ring-primary/30"
                                      : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                                  )}
                                />
                                {step4Errors.cardCvc && (
                                  <p className="mt-1 text-xs text-primary flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {step4Errors.cardCvc}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-wood mb-1.5">
                                Nom sur la carte <span className="text-primary">*</span>
                              </label>
                              <input
                                type="text"
                                value={cardForm.name}
                                onChange={(e) => {
                                  setCardForm({ ...cardForm, name: e.target.value });
                                  setStep4Errors((prev) => ({ ...prev, cardName: "" }));
                                }}
                                placeholder="JEAN DUPONT"
                                className={cn(
                                  "w-full px-4 py-3 rounded-xl border bg-cream/50 text-wood placeholder:text-wood/30 focus:outline-none focus:ring-2 transition-all uppercase",
                                  step4Errors.cardName
                                    ? "border-primary/50 focus:ring-primary/30"
                                    : "border-wood/15 focus:ring-primary/20 focus:border-primary/30"
                                )}
                              />
                              {step4Errors.cardName && (
                                <p className="mt-1 text-xs text-primary flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {step4Errors.cardName}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-xs text-wood-light">
                            <Lock className="w-3.5 h-3.5 text-secondary" />
                            Paiement sécurisé par chiffrement SSL
                          </div>
                        </div>
                      )}

                      {/* CGV */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <div className="mt-0.5">
                            <input
                              type="checkbox"
                              checked={acceptCGV}
                              onChange={(e) => {
                                setAcceptCGV(e.target.checked);
                                setStep4Errors((prev) => ({ ...prev, cgv: "" }));
                              }}
                              className="sr-only peer"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                acceptCGV
                                  ? "bg-primary border-primary"
                                  : step4Errors.cgv
                                  ? "border-primary/50"
                                  : "border-wood/30"
                              )}
                            >
                              {acceptCGV && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                          <span className="text-sm text-wood-light leading-relaxed">
                            J&apos;accepte les{" "}
                            <button className="text-primary hover:text-primary-dark font-medium underline">
                              conditions générales de vente
                            </button>{" "}
                            et la{" "}
                            <button className="text-primary hover:text-primary-dark font-medium underline">
                              politique de confidentialité
                            </button>
                          </span>
                        </label>
                        {step4Errors.cgv && (
                          <p className="mt-2 text-xs text-primary flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {step4Errors.cgv}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ── Right: Order summary (2 cols) ──────────────────────── */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5 sticky top-32">
                        <h3 className="font-heading font-semibold text-wood mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-accent" />
                          Récapitulatif
                        </h3>

                        {/* Items */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {cart.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-2 pb-3 border-b border-wood/5 last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-wood text-sm truncate">
                                  {item.quantity > 1 && (
                                    <span className="text-primary font-bold mr-1">
                                      {item.quantity}x
                                    </span>
                                  )}
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-wood-light">
                                  {item.size.name}
                                  {item.supplements.length > 0 && (
                                    <span>
                                      {" "}
                                      + {item.supplements.map((s) => s.name).join(", ")}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-wood whitespace-nowrap">
                                {formatPrice(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Price breakdown */}
                        <div className="space-y-2 pt-2 border-t border-wood/10">
                          <div className="flex justify-between text-sm">
                            <span className="text-wood-light">Sous-total</span>
                            <span className="text-wood font-medium">
                              {formatPrice(cart.subtotal())}
                            </span>
                          </div>
                          {cart.deliveryFee() > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-wood-light">Livraison</span>
                              <span className="text-wood font-medium">
                                {formatPrice(cart.deliveryFee())}
                              </span>
                            </div>
                          )}
                          {cart.discount() > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-secondary">Réduction</span>
                              <span className="text-secondary font-medium">
                                -{formatPrice(cart.discount())}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-wood/10">
                            <span className="font-heading font-bold text-wood text-lg">
                              Total TTC
                            </span>
                            <span className="font-heading font-bold text-primary text-lg">
                              {formatPrice(cart.total())}
                            </span>
                          </div>
                        </div>

                        {/* Mode info */}
                        <div className="mt-4 p-3 rounded-lg bg-cream/80 border border-wood/5">
                          <div className="flex items-center gap-2 text-xs text-wood-light">
                            {selectedMode === "DELIVERY" && <Truck className="w-3.5 h-3.5" />}
                            {selectedMode === "TAKEAWAY" && <ShoppingBag className="w-3.5 h-3.5" />}
                            {selectedMode === "DINE_IN" && <UtensilsCrossed className="w-3.5 h-3.5" />}
                            <span>
                              {selectedMode === "DELIVERY" && "Livraison"}
                              {selectedMode === "TAKEAWAY" && "À emporter"}
                              {selectedMode === "DINE_IN" && "Sur place"}
                              {" — "}
                              {getEstimatedTime()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 text-wood hover:text-primary font-semibold px-6 py-3 rounded-full border-2 border-wood/15 hover:border-primary/30 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Retour
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className={cn(
                        "inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full shadow-lg transition-all duration-300",
                        isProcessing
                          ? "bg-wood/30 text-white cursor-not-allowed"
                          : "bg-accent hover:bg-accent-light text-white hover:shadow-xl"
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <svg
                            className="animate-spin w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Payer {formatPrice(cart.total())}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 5 — CONFIRMATION
                ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 5 && (
              <div className="max-w-2xl mx-auto text-center">
                {/* Success animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="mx-auto w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                    className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
                    Commande confirmée !
                  </h2>
                  <p className="text-wood-light text-lg mb-8">
                    Merci pour votre commande chez Au Paradizzio
                  </p>
                </motion.div>

                {/* Order details card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-wood/5 text-left mb-6"
                >
                  {/* Order number */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-wood/10">
                    <div>
                      <p className="text-xs text-wood-light uppercase tracking-wide font-medium mb-1">
                        Numéro de commande
                      </p>
                      <p className="font-heading font-bold text-wood text-xl">{orderNumber}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
                      Confirmée
                    </div>
                  </div>

                  {/* Delivery/pickup info */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-cream/80">
                    {selectedMode === "DELIVERY" && <Truck className="w-5 h-5 text-primary" />}
                    {selectedMode === "TAKEAWAY" && <ShoppingBag className="w-5 h-5 text-primary" />}
                    {selectedMode === "DINE_IN" && <UtensilsCrossed className="w-5 h-5 text-primary" />}
                    <div className="text-sm">
                      <span className="font-semibold text-wood">
                        {selectedMode === "DELIVERY" && "Livraison"}
                        {selectedMode === "TAKEAWAY" && "À emporter"}
                        {selectedMode === "DINE_IN" && "Sur place"}
                      </span>
                      <span className="text-wood-light ml-2">— {getEstimatedTime()}</span>
                    </div>
                  </div>

                  {/* Email confirmation */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                    <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                    <p className="text-sm text-wood-light">
                      Un email de confirmation vous sera envoyé à{" "}
                      <strong className="text-wood">{getUserEmail()}</strong>
                    </p>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link
                    href={`/suivi/${orderNumber}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Suivre ma commande
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-wood hover:text-primary font-semibold px-6 py-3 rounded-full border-2 border-wood/15 hover:border-primary/30 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    Retour à l&apos;accueil
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
