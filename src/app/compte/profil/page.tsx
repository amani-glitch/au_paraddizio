"use client";

import { useState, type FormEvent } from "react";
import { User, Mail, Phone, Lock, Save, Trash2, Check } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export default function ProfilPage() {
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Le nom est requis";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Email invalide";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (user) {
      setUser({ ...user, name: name.trim(), email, phone: phone || undefined });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Mot de passe actuel requis";
    if (newPassword.length < 6) next.newPassword = "Minimum 6 caractères";
    if (newPassword !== confirmPassword)
      next.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors((prev) => ({ ...prev, ...next }));
    if (Object.keys(next).length > 0) return;

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  function handleDeleteAccount() {
    // Mock — would call API
    setShowDeleteConfirm(false);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-wood">Mon profil</h1>

      {/* Profile form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 font-heading text-lg font-semibold text-wood">
          Informations personnelles
        </h2>

        <div className="space-y-4">
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
                className={cn(
                  "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.name ? "border-red-400" : "border-gray-200 focus:border-primary"
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
                className={cn(
                  "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.email ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Enregistré
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer
            </>
          )}
        </button>
      </form>

      {/* Password change */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 font-heading text-lg font-semibold text-wood">
          Changer le mot de passe
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="current-pw" className="mb-1.5 block text-sm font-medium text-gray-700">
              Mot de passe actuel
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={cn(
                  "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.currentPassword ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="new-pw" className="mb-1.5 block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className={cn(
                  "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.newPassword ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-pw" className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.confirmPassword ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center gap-2 rounded-lg bg-wood px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-wood-light"
        >
          {passwordSaved ? (
            <>
              <Check className="h-4 w-4" />
              Mot de passe modifié
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Modifier le mot de passe
            </>
          )}
        </button>
      </form>

      {/* Delete account */}
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="mb-2 font-heading text-lg font-semibold text-red-600">
          Zone de danger
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          La suppression de votre compte est irréversible. Toutes vos données seront
          définitivement supprimées.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Êtes-vous sûr de vouloir supprimer votre compte ?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Oui, supprimer
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
