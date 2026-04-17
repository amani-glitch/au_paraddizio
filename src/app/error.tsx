"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-wood">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-gray-500">
          Veuillez réessayer ou retourner à l&apos;accueil.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-wood hover:bg-gray-50"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
