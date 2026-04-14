"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak: { label: "Faible", color: "bg-red-500", width: "w-1/3" },
  medium: { label: "Moyen", color: "bg-accent", width: "w-2/3" },
  strong: { label: "Fort", color: "bg-secondary", width: "w-full" },
};

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  cgv?: string;
}

export default function InscriptionPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = password.length > 0 ? getPasswordStrength(password) : null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Le nom est requis";
    if (!email) {
      next.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Format d'email invalide";
    }
    if (phone && !/^[0-9+\s()-]{6,20}$/.test(phone)) {
      next.phone = "Format de t\u00e9l\u00e9phone invalide";
    }
    if (!password) {
      next.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      next.password = "Le mot de passe doit contenir au moins 6 caract\u00e8res";
    }
    if (password !== confirmPassword) {
      next.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!cgvAccepted) {
      next.cgv = "Vous devez accepter les CGV";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    setUser({
      id: "user-1",
      email,
      name: name.trim(),
      phone: phone || undefined,
      role: "CUSTOMER",
      loyaltyPoints: 0,
      addresses: [],
    });

    router.push("/compte");
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Au Paradizzio
            </h1>
            <p className="mt-1 text-sm text-wood">Pizzeria artisanale</p>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center font-heading text-2xl font-bold text-wood">
            Cr&eacute;er un compte
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-primary"
                  )}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-primary"
                  )}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                T&eacute;l&eacute;phone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.phone ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-primary"
                  )}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caract\u00e8res"
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.password ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-primary"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

              {/* Strength indicator */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        strengthConfig[strength].color,
                        strengthConfig[strength].width
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      strength === "weak" && "text-red-500",
                      strength === "medium" && "text-accent",
                      strength === "strong" && "text-secondary"
                    )}
                  >
                    S&eacute;curit&eacute; : {strengthConfig[strength].label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre mot de passe"
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-primary"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* CGV checkbox */}
            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={cgvAccepted}
                  onChange={(e) => setCgvAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                />
                <span className="text-sm text-gray-600">
                  J&apos;accepte les{" "}
                  <Link href="#" className="font-medium text-primary hover:text-primary-dark">
                    CGV
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="font-medium text-primary hover:text-primary-dark">
                    politique de confidentialit&eacute;
                  </Link>
                </span>
              </label>
              {errors.cgv && <p className="mt-1 text-xs text-red-500">{errors.cgv}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Cr&eacute;er mon compte
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            D&eacute;j&agrave; un compte ?{" "}
            <Link
              href="/connexion"
              className="font-semibold text-primary hover:text-primary-dark"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
