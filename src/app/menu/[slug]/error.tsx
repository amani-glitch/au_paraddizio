"use client";

import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-wood">
        Erreur de chargement
      </h1>
      <p className="mt-2 text-gray-500">
        Impossible de charger ce produit. Veuillez réessayer.
      </p>
      <pre className="mx-auto mt-4 max-w-lg overflow-auto rounded bg-red-50 p-4 text-left text-xs text-red-700">
        {error.message}
      </pre>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Réessayer
        </button>
        <Link
          href="/menu"
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-wood hover:bg-gray-50"
        >
          Retour au menu
        </Link>
      </div>
    </div>
  );
}
