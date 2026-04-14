"use client";

import { useState } from "react";
import {
  Save,
  Store,
  Clock,
  Truck,
  CreditCard,
  Upload,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { storeInfo, deliveryZones } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "general" | "horaires" | "livraison" | "paiement";

interface HourRow {
  dayOfWeek: number;
  dayName: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

interface ClosureEntry {
  id: string;
  date: string;
  reason: string;
}

interface DeliveryZoneForm {
  id: string;
  name: string;
  postalCodes: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedMinutes: number;
  freeDeliveryAbove: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const tabs: { id: TabId; label: string; icon: typeof Store }[] = [
  { id: "general", label: "General", icon: Store },
  { id: "horaires", label: "Horaires", icon: Clock },
  { id: "livraison", label: "Livraison", icon: Truck },
  { id: "paiement", label: "Paiement", icon: CreditCard },
];

const dayNames = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="font-heading text-2xl font-bold text-wood">Parametres</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {activeTab === "general" && <TabGeneral />}
        {activeTab === "horaires" && <TabHoraires />}
        {activeTab === "livraison" && <TabLivraison />}
        {activeTab === "paiement" && <TabPaiement />}

        {/* Save button */}
        <div className="mt-8 flex items-center gap-3 border-t border-gray-100 pt-6">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary animate-fade-in">
              <Check className="h-4 w-4" />
              Modifications enregistrees
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab General ─────────────────────────────────────────────────────────────

function TabGeneral() {
  const [name, setName] = useState(storeInfo.name);
  const [address, setAddress] = useState(storeInfo.address);
  const [phone, setPhone] = useState(storeInfo.phone);
  const [email, setEmail] = useState(storeInfo.email);
  const [ordersPerSlot, setOrdersPerSlot] = useState(5);
  const [slotDuration, setSlotDuration] = useState("15");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [takeawayEnabled, setTakeawayEnabled] = useState(true);
  const [dineInEnabled, setDineInEnabled] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Informations du restaurant
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom du restaurant
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Telephone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logo upload */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Logo
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Choisir un fichier
            </button>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG ou SVG. Max 2 Mo.
            </p>
          </div>
        </div>
      </div>

      {/* Order settings */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Parametres de commande
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Commandes par creneau max
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={ordersPerSlot}
              onChange={(e) => setOrdersPerSlot(parseInt(e.target.value) || 5)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Duree du creneau
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mode toggles */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Modes de commande
        </h3>
        <div className="space-y-3">
          <ToggleRow
            label="Livraison activee"
            description="Les clients peuvent commander en livraison"
            enabled={deliveryEnabled}
            onToggle={() => setDeliveryEnabled(!deliveryEnabled)}
          />
          <ToggleRow
            label="A emporter active"
            description="Les clients peuvent commander a emporter"
            enabled={takeawayEnabled}
            onToggle={() => setTakeawayEnabled(!takeawayEnabled)}
          />
          <ToggleRow
            label="Sur place active"
            description="Les clients peuvent commander sur place"
            enabled={dineInEnabled}
            onToggle={() => setDineInEnabled(!dineInEnabled)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tab Horaires ────────────────────────────────────────────────────────────

function TabHoraires() {
  const [hours, setHours] = useState<HourRow[]>(() =>
    storeInfo.openingHours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      dayName: dayNames[h.dayOfWeek],
      isClosed: h.isClosed,
      openTime: h.openTime,
      closeTime: h.closeTime,
    }))
  );

  const [closures, setClosures] = useState<ClosureEntry[]>([
    { id: "cl-1", date: "2026-05-01", reason: "Fete du Travail" },
    { id: "cl-2", date: "2026-08-15", reason: "Assomption" },
  ]);
  const [newClosureDate, setNewClosureDate] = useState("");
  const [newClosureReason, setNewClosureReason] = useState("");

  function updateHour(
    dayOfWeek: number,
    field: keyof HourRow,
    value: string | boolean
  ) {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  }

  function addClosure() {
    if (!newClosureDate) return;
    setClosures((prev) => [
      ...prev,
      {
        id: `cl-${Date.now()}`,
        date: newClosureDate,
        reason: newClosureReason || "Fermeture exceptionnelle",
      },
    ]);
    setNewClosureDate("");
    setNewClosureReason("");
  }

  function removeClosure(id: string) {
    setClosures((prev) => prev.filter((c) => c.id !== id));
  }

  // Show days in order: Lundi(1), Mardi(2), ..., Dimanche(0)
  const sortedHours = [...hours].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Horaires d&apos;ouverture
        </h3>
        <div className="space-y-2">
          {sortedHours.map((row) => (
            <div
              key={row.dayOfWeek}
              className={cn(
                "flex flex-wrap items-center gap-4 rounded-lg border p-3 transition-colors",
                row.isClosed
                  ? "border-gray-100 bg-gray-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <span className="w-24 text-sm font-medium text-gray-700">
                {row.dayName}
              </span>

              {/* Closed toggle */}
              <button
                onClick={() =>
                  updateHour(row.dayOfWeek, "isClosed", !row.isClosed)
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  row.isClosed
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                )}
              >
                {row.isClosed ? "Ferme" : "Ouvert"}
              </button>

              {/* Time inputs */}
              {!row.isClosed && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">De</label>
                    <input
                      type="time"
                      value={row.openTime}
                      onChange={(e) =>
                        updateHour(row.dayOfWeek, "openTime", e.target.value)
                      }
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">a</label>
                    <input
                      type="time"
                      value={row.closeTime}
                      onChange={(e) =>
                        updateHour(row.dayOfWeek, "closeTime", e.target.value)
                      }
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Closures */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Fermetures exceptionnelles
        </h3>
        <div className="space-y-2">
          {closures.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {c.date}
                </span>
                <span className="text-sm text-gray-500">{c.reason}</span>
              </div>
              <button
                onClick={() => removeClosure(c.id)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add closure */}
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Date
              </label>
              <input
                type="date"
                value={newClosureDate}
                onChange={(e) => setNewClosureDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Motif
              </label>
              <input
                type="text"
                placeholder="Ex: Jour ferie"
                value={newClosureReason}
                onChange={(e) => setNewClosureReason(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <button
              onClick={addClosure}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-light"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Livraison ───────────────────────────────────────────────────────────

function TabLivraison() {
  const [zones, setZones] = useState<DeliveryZoneForm[]>(() =>
    deliveryZones.map((z) => ({
      id: z.id,
      name: z.name,
      postalCodes: z.postalCodes.join(", "),
      deliveryFee: z.deliveryFee,
      minOrderAmount: z.minOrderAmount,
      estimatedMinutes: z.estimatedMinutes,
      freeDeliveryAbove: z.freeDeliveryAbove ?? 0,
    }))
  );

  const [showNewZone, setShowNewZone] = useState(false);
  const [newZone, setNewZone] = useState<DeliveryZoneForm>({
    id: "",
    name: "",
    postalCodes: "",
    deliveryFee: 0,
    minOrderAmount: 15,
    estimatedMinutes: 30,
    freeDeliveryAbove: 0,
  });

  function updateZone(
    id: string,
    field: keyof DeliveryZoneForm,
    value: string | number
  ) {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );
  }

  function deleteZone(id: string) {
    if (confirm("Supprimer cette zone de livraison ?")) {
      setZones((prev) => prev.filter((z) => z.id !== id));
    }
  }

  function addZone() {
    if (!newZone.name.trim()) return;
    setZones((prev) => [...prev, { ...newZone, id: `zone-${Date.now()}` }]);
    setNewZone({
      id: "",
      name: "",
      postalCodes: "",
      deliveryFee: 0,
      minOrderAmount: 15,
      estimatedMinutes: 30,
      freeDeliveryAbove: 0,
    });
    setShowNewZone(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-gray-900">
          Zones de livraison
        </h3>
        <button
          onClick={() => setShowNewZone(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-light"
        >
          <Plus className="h-4 w-4" />
          Ajouter une zone
        </button>
      </div>

      <div className="space-y-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="font-heading text-base font-semibold text-gray-900">
                  {zone.name}
                </h4>
              </div>
              <button
                onClick={() => deleteZone(zone.id)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Codes postaux
                </label>
                <input
                  type="text"
                  value={zone.postalCodes}
                  onChange={(e) =>
                    updateZone(zone.id, "postalCodes", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Frais de livraison (EUR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={zone.deliveryFee}
                  onChange={(e) =>
                    updateZone(
                      zone.id,
                      "deliveryFee",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Minimum commande (EUR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={zone.minOrderAmount}
                  onChange={(e) =>
                    updateZone(
                      zone.id,
                      "minOrderAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Temps estime (min)
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={zone.estimatedMinutes}
                  onChange={(e) =>
                    updateZone(
                      zone.id,
                      "estimatedMinutes",
                      parseInt(e.target.value) || 30
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Seuil livraison gratuite (EUR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={zone.freeDeliveryAbove}
                  onChange={(e) =>
                    updateZone(
                      zone.id,
                      "freeDeliveryAbove",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New zone form */}
      {showNewZone && (
        <div className="rounded-xl border-2 border-dashed border-secondary/30 bg-green-50/30 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-heading text-base font-semibold text-gray-900">
              Nouvelle zone de livraison
            </h4>
            <button
              onClick={() => setShowNewZone(false)}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Nom de la zone
              </label>
              <input
                type="text"
                value={newZone.name}
                onChange={(e) =>
                  setNewZone({ ...newZone, name: e.target.value })
                }
                placeholder="Ex: Avignon centre"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Codes postaux
              </label>
              <input
                type="text"
                value={newZone.postalCodes}
                onChange={(e) =>
                  setNewZone({ ...newZone, postalCodes: e.target.value })
                }
                placeholder="84000, 84100"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Frais de livraison (EUR)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={newZone.deliveryFee}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    deliveryFee: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Minimum commande (EUR)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={newZone.minOrderAmount}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    minOrderAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Temps estime (min)
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={newZone.estimatedMinutes}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    estimatedMinutes: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Seuil livraison gratuite (EUR)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={newZone.freeDeliveryAbove}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    freeDeliveryAbove: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={addZone}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-light"
            >
              <Check className="h-4 w-4" />
              Ajouter la zone
            </button>
            <button
              onClick={() => setShowNewZone(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab Paiement ────────────────────────────────────────────────────────────

function TabPaiement() {
  const [cardEnabled, setCardEnabled] = useState(true);
  const [titresRestaurant, setTitresRestaurant] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [applePayEnabled, setApplePayEnabled] = useState(false);
  const [cashEnabled, setCashEnabled] = useState(true);
  const [stripePublicKey, setStripePublicKey] = useState(
    "pk_live_***************"
  );
  const [stripeSecretKey, setStripeSecretKey] = useState(
    "sk_live_***************"
  );
  const [showStripePublic, setShowStripePublic] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Modes de paiement acceptes
        </h3>
        <div className="space-y-3">
          <ToggleRow
            label="Carte bancaire"
            description="Visa, Mastercard, CB via Stripe"
            enabled={cardEnabled}
            onToggle={() => setCardEnabled(!cardEnabled)}
          />
          <ToggleRow
            label="Titres-restaurant"
            description="Ticket Restaurant, Swile, Edenred"
            enabled={titresRestaurant}
            onToggle={() => setTitresRestaurant(!titresRestaurant)}
          />
          <ToggleRow
            label="PayPal"
            description="Paiement via compte PayPal"
            enabled={paypalEnabled}
            onToggle={() => setPaypalEnabled(!paypalEnabled)}
          />
          <ToggleRow
            label="Apple Pay / Google Pay"
            description="Paiement sans contact via mobile"
            enabled={applePayEnabled}
            onToggle={() => setApplePayEnabled(!applePayEnabled)}
          />
          <ToggleRow
            label="Especes"
            description="Paiement en especes a la livraison ou au comptoir"
            enabled={cashEnabled}
            onToggle={() => setCashEnabled(!cashEnabled)}
          />
        </div>
      </div>

      {/* Stripe keys */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Configuration Stripe
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cle publique
            </label>
            <div className="relative">
              <input
                type={showStripePublic ? "text" : "password"}
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button
                onClick={() => setShowStripePublic(!showStripePublic)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showStripePublic ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cle secrete
            </label>
            <div className="relative">
              <input
                type={showStripeSecret ? "text" : "password"}
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showStripeSecret ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <CreditCard className="h-3.5 w-3.5" />
          Les cles Stripe sont stockees de maniere securisee.
        </p>
      </div>
    </div>
  );
}

// ─── Toggle Row helper ───────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button onClick={onToggle} className="flex-shrink-0">
        {enabled ? (
          <ToggleRight className="h-7 w-7 text-secondary" />
        ) : (
          <ToggleLeft className="h-7 w-7 text-gray-300" />
        )}
      </button>
    </div>
  );
}
