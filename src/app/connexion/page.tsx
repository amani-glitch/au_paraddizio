"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export default function ConnexionPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email) {
      next.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Format d'email invalide";
    }
    if (!password) {
      next.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      next.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Identifiants incorrects" });
        return;
      }

      setUser(data.user);
      toast.success("Connexion réussie !");

      const role = data.user?.role;
      if (role === "ADMIN" || role === "MANAGER") {
        router.push("/admin");
      } else {
        router.push("/compte");
      }
    } catch {
      setErrors({ general: "Erreur de connexion au serveur. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
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
            Se connecter
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* General error */}
            {errors.general && (
              <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                {errors.general}
              </div>
            )}

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
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-primary"
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
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
                  placeholder="Votre mot de passe"
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-primary"
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                href="#"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Mot de passe oubli&eacute; ?
              </Link>
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
                <LogIn className="h-4 w-4" />
              )}
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-[#1877F2] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#166FE5]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuer avec Facebook
            </button>
          </div>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="font-semibold text-primary hover:text-primary-dark"
            >
              Cr&eacute;er un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
