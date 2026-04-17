"use client";

import { useState } from "react";
import {
  Award,
  Gift,
  Coffee,
  Pizza,
  TrendingUp,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface LoyaltyTransaction {
  id: string;
  type: "earned" | "redeemed";
  description: string;
  points: number;
  date: string;
}

const mockTransactions: LoyaltyTransaction[] = [
  {
    id: "lt-1",
    type: "earned",
    description: "Commande #PAR-20260410-A7F2",
    points: 30,
    date: "2026-04-10",
  },
  {
    id: "lt-2",
    type: "earned",
    description: "Commande #PAR-20260407-K9D1",
    points: 22,
    date: "2026-04-07",
  },
  {
    id: "lt-3",
    type: "redeemed",
    description: "Boisson offerte",
    points: -50,
    date: "2026-04-05",
  },
  {
    id: "lt-4",
    type: "earned",
    description: "Commande #PAR-20260401-B3E5",
    points: 20,
    date: "2026-04-01",
  },
  {
    id: "lt-5",
    type: "earned",
    description: "Commande #PAR-20260325-X1C8",
    points: 13,
    date: "2026-03-25",
  },
  {
    id: "lt-6",
    type: "earned",
    description: "Bonus inscription",
    points: 50,
    date: "2026-03-15",
  },
  {
    id: "lt-7",
    type: "redeemed",
    description: "Réduction 5\u20ac",
    points: -100,
    date: "2026-03-10",
  },
  {
    id: "lt-8",
    type: "earned",
    description: "Commande #PAR-20260305-Z4R9",
    points: 57,
    date: "2026-03-05",
  },
];

const rewardTiers = [
  {
    points: 50,
    label: "Boisson offerte",
    description: "Un soda ou eau minérale au choix",
    icon: Coffee,
    color: "text-blue-600 bg-blue-50",
  },
  {
    points: 100,
    label: "5\u20ac de réduction",
    description: "Sur votre prochaine commande",
    icon: Gift,
    color: "text-accent bg-accent/10",
  },
  {
    points: 200,
    label: "Pizza offerte",
    description: "Pizza au choix (taille 29 cm)",
    icon: Pizza,
    color: "text-primary bg-primary/10",
  },
];

export default function FidelitePage() {
  const user = useAuthStore((s) => s.user);
  const [showRedeemInfo, setShowRedeemInfo] = useState(false);

  const points = user?.loyaltyPoints ?? 0;

  // Next reward calculation
  const nextReward = rewardTiers.find((t) => t.points > points) ?? rewardTiers[rewardTiers.length - 1];
  const prevThreshold = rewardTiers
    .filter((t) => t.points <= points)
    .pop()?.points ?? 0;
  const progressPercent =
    nextReward.points > points
      ? Math.round(
          ((points - prevThreshold) / (nextReward.points - prevThreshold)) * 100
        )
      : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6 text-accent" />
        <h1 className="font-heading text-2xl font-bold text-wood">
          Programme de fidélité
        </h1>
      </div>

      {/* Points display */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-lg">
        <div className="flex flex-col items-center text-center">
          <Star className="mb-2 h-8 w-8 text-accent" />
          <p className="text-sm font-medium text-white/80">Vos points</p>
          <p className="mt-1 text-5xl font-bold">{points}</p>
          <p className="mt-1 text-sm text-white/60">points de fidélité</p>
        </div>

        {/* Progress to next reward */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Prochaine récompense</span>
            <span className="font-medium">
              {nextReward.points > points
                ? `${nextReward.points - points} pts restants`
                : "Récompense disponible !"}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-white/60">
            {nextReward.label} — {nextReward.points} points
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-heading text-lg font-semibold text-wood">
          Comment ça marche ?
        </h2>
        <div className="flex items-start gap-3 rounded-lg bg-cream p-4">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
          <div>
            <p className="text-sm font-medium text-wood">
              Gagnez 1 point par euro dépensé
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Les points sont automatiquement crédités après chaque commande
              livrée. 100 points = 5€ de réduction sur votre prochaine
              commande.
            </p>
          </div>
        </div>
      </div>

      {/* Reward tiers */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-lg font-semibold text-wood">
          Paliers de récompenses
        </h2>
        <div className="space-y-3">
          {rewardTiers.map((tier) => {
            const Icon = tier.icon;
            const isUnlocked = points >= tier.points;
            return (
              <div
                key={tier.points}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                  isUnlocked
                    ? "border-secondary/30 bg-secondary/5"
                    : "border-gray-100"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                    tier.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-wood">{tier.label}</h3>
                    {isUnlocked && (
                      <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold text-secondary">
                        Disponible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{tier.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-lg font-bold",
                      isUnlocked ? "text-secondary" : "text-gray-400"
                    )}
                  >
                    {tier.points}
                  </p>
                  <p className="text-[10px] text-gray-400">points</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Use points button */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => setShowRedeemInfo(!showRedeemInfo)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-light"
        >
          <Gift className="h-4 w-4" />
          Utiliser mes points
        </button>

        {showRedeemInfo && (
          <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm text-gray-700">
              Vos points seront automatiquement utilisables lors de votre prochaine
              commande. Choisissez votre récompense au moment du paiement.
            </p>
            {points >= 50 && (
              <p className="mt-2 text-sm font-medium text-secondary">
                Vous avez assez de points pour : {rewardTiers.filter((t) => t.points <= points).map((t) => t.label).join(", ")}.
              </p>
            )}
            {points < 50 && (
              <p className="mt-2 text-sm text-gray-500">
                Il vous manque encore {50 - points} points pour votre première récompense.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-lg font-semibold text-wood">
          Historique des points
        </h2>
        <div className="space-y-2">
          {mockTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-gray-50 px-4 py-3 transition-colors hover:bg-cream/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    tx.type === "earned"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-red-50 text-red-500"
                  )}
                >
                  {tx.type === "earned" ? (
                    <Plus className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-wood">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-bold",
                  tx.type === "earned" ? "text-secondary" : "text-red-500"
                )}
              >
                {tx.type === "earned" ? "+" : ""}
                {tx.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
