"use client";

import { useState, type FormEvent } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Address } from "@/types";

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Maison",
    street: "12 Rue des Oliviers",
    city: "Entraigues-sur-la-Sorgue",
    postalCode: "84320",
    instructions: "Interphone 3B, 2\u00e8me \u00e9tage",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Bureau",
    street: "45 Avenue de la R\u00e9publique",
    city: "Avignon",
    postalCode: "84000",
    instructions: "B\u00e2timent B, accueil",
    isDefault: false,
  },
];

interface AddressFormData {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  instructions: string;
}

const emptyForm: AddressFormData = {
  label: "",
  street: "",
  city: "",
  postalCode: "",
  instructions: "",
};

export default function AdressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  }

  function openEditForm(addr: Address) {
    setForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
      instructions: addr.instructions ?? "",
    });
    setEditingId(addr.id);
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.label.trim()) next.label = "Le libell\u00e9 est requis";
    if (!form.street.trim()) next.street = "L'adresse est requise";
    if (!form.city.trim()) next.city = "La ville est requise";
    if (!form.postalCode.trim()) {
      next.postalCode = "Le code postal est requis";
    } else if (!/^\d{5}$/.test(form.postalCode.trim())) {
      next.postalCode = "Code postal invalide (5 chiffres)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                label: form.label.trim(),
                street: form.street.trim(),
                city: form.city.trim(),
                postalCode: form.postalCode.trim(),
                instructions: form.instructions.trim() || undefined,
              }
            : a
        )
      );
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        label: form.label.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        instructions: form.instructions.trim() || undefined,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
    }
    closeForm();
  }

  function handleDelete(id: string) {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      // If we deleted the default, make the first one default
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-wood">
            Mes adresses
          </h1>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Ajouter une adresse
          </button>
        )}
      </div>

      {/* Address form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-wood">
              {editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Label */}
            <div>
              <label htmlFor="addr-label" className="mb-1.5 block text-sm font-medium text-gray-700">
                Libell&eacute; (ex: Maison, Bureau)
              </label>
              <input
                id="addr-label"
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Maison"
                className={cn(
                  "w-full rounded-lg border py-2.5 px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.label ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
              {errors.label && <p className="mt-1 text-xs text-red-500">{errors.label}</p>}
            </div>

            {/* Postal code */}
            <div>
              <label htmlFor="addr-postal" className="mb-1.5 block text-sm font-medium text-gray-700">
                Code postal
              </label>
              <input
                id="addr-postal"
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="84320"
                className={cn(
                  "w-full rounded-lg border py-2.5 px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.postalCode ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
              )}
            </div>

            {/* Street */}
            <div className="sm:col-span-2">
              <label htmlFor="addr-street" className="mb-1.5 block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                id="addr-street"
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="12 Rue des Oliviers"
                className={cn(
                  "w-full rounded-lg border py-2.5 px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.street ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
              {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street}</p>}
            </div>

            {/* City */}
            <div className="sm:col-span-2">
              <label htmlFor="addr-city" className="mb-1.5 block text-sm font-medium text-gray-700">
                Ville
              </label>
              <input
                id="addr-city"
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Entraigues-sur-la-Sorgue"
                className={cn(
                  "w-full rounded-lg border py-2.5 px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.city ? "border-red-400" : "border-gray-200 focus:border-primary"
                )}
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            {/* Instructions */}
            <div className="sm:col-span-2">
              <label htmlFor="addr-instructions" className="mb-1.5 block text-sm font-medium text-gray-700">
                Instructions de livraison (optionnel)
              </label>
              <textarea
                id="addr-instructions"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Interphone, \u00e9tage, code d'entr\u00e9e..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
            >
              <Save className="h-4 w-4" />
              {editingId ? "Mettre \u00e0 jour" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <MapPin className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">
            Aucune adresse enregistr&eacute;e
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Ajoutez une adresse pour faciliter vos commandes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "relative rounded-xl border bg-white p-5 shadow-sm transition-colors",
                addr.isDefault ? "border-primary/30" : "border-gray-100"
              )}
            >
              {/* Default badge */}
              {addr.isDefault && (
                <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <Star className="h-3 w-3" />
                  Par d&eacute;faut
                </span>
              )}

              <div className="mb-3 mt-1">
                <h3 className="text-sm font-bold text-wood">{addr.label}</h3>
                <p className="mt-1 text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">
                  {addr.postalCode} {addr.city}
                </p>
                {addr.instructions && (
                  <p className="mt-1 text-xs italic text-gray-400">
                    {addr.instructions}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(addr)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
                >
                  <Pencil className="h-3 w-3" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-red-300 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </button>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-accent hover:text-accent"
                  >
                    <Star className="h-3 w-3" />
                    D&eacute;finir par d&eacute;faut
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
