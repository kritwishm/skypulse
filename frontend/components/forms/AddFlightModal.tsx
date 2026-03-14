"use client";

import { useState, useCallback, useEffect, type FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import AirportInput from "@/components/forms/AirportInput";
import type { FlightWatch, FlightWatchCreate } from "@/lib/types";

interface AddFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FlightWatchCreate) => void;
  editingFlight?: FlightWatch | null;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;

const STOP_OPTIONS = [
  { value: null, label: "Any" },
  { value: 0, label: "Nonstop" },
  { value: 1, label: "1 Stop" },
  { value: 2, label: "2 Stops" },
] as const;

const inputClasses =
  "rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2.5 text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-blue-500/40 focus:bg-slate-800/50 focus:ring-1 focus:ring-blue-500/20 [color-scheme:dark]";

const initialState: FlightWatchCreate = {
  origin: "",
  destination: "",
  departure_date: "",
  trip_type: "one-way",
  currency: "INR",
  max_stops: null,
};

export default function AddFlightModal({
  isOpen,
  onClose,
  onSubmit,
  editingFlight,
}: AddFlightModalProps) {
  const [form, setForm] = useState<FlightWatchCreate>({ ...initialState });

  const isEditing = !!editingFlight;

  useEffect(() => {
    if (editingFlight) {
      setForm({
        origin: editingFlight.origin,
        destination: editingFlight.destination,
        departure_date: editingFlight.departure_date,
        departure_date_end: editingFlight.departure_date_end ?? undefined,
        return_date: editingFlight.return_date ?? undefined,
        return_date_end: editingFlight.return_date_end ?? undefined,
        trip_type: editingFlight.trip_type as "one-way" | "round-trip",
        currency: editingFlight.currency,
        max_price: editingFlight.max_price ?? undefined,
        max_stops: editingFlight.max_stops,
      });
    } else {
      setForm({ ...initialState });
    }
  }, [editingFlight]);

  const update = useCallback(
    <K extends keyof FlightWatchCreate>(key: K, value: FlightWatchCreate[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleClose = useCallback(() => {
    setForm({ ...initialState });
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (form.origin.length !== 3 || form.destination.length !== 3) return;
      if (!form.departure_date) return;
      if (form.trip_type === "round-trip" && !form.return_date) return;

      const payload: FlightWatchCreate = {
        origin: form.origin,
        destination: form.destination,
        departure_date: form.departure_date,
        trip_type: form.trip_type,
        currency: form.currency,
        max_stops: form.max_stops ?? null,
      };

      if (form.departure_date_end && form.departure_date_end > form.departure_date) {
        payload.departure_date_end = form.departure_date_end;
      }

      if (form.trip_type === "round-trip" && form.return_date) {
        payload.return_date = form.return_date;
        if (form.return_date_end && form.return_date_end > form.return_date) {
          payload.return_date_end = form.return_date_end;
        }
      } else {
        // Explicitly clear return dates for one-way (needed for edits)
        payload.return_date = null;
        payload.return_date_end = null;
      }

      if (form.max_price && form.max_price > 0) {
        payload.max_price = form.max_price;
      } else {
        payload.max_price = null;
      }

      onSubmit(payload);
      handleClose();
    },
    [form, onSubmit, handleClose],
  );

  const segmentBtn = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
      active
        ? "bg-blue-500/15 text-blue-300 shadow-sm"
        : "text-slate-500 hover:text-slate-300"
    }`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit Flight Watch" : "Add Flight Watch"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Origin & Destination */}
        <div className="grid grid-cols-2 gap-4">
          <AirportInput
            value={form.origin}
            onChange={(v) => update("origin", v)}
            placeholder="DEL"
            label="Origin"
            required
          />
          <AirportInput
            value={form.destination}
            onChange={(v) => update("destination", v)}
            placeholder="BOM"
            label="Destination"
            required
          />
        </div>

        {/* Departure Date Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">
            Departure Dates<span className="text-red-400 ml-0.5">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-500">From</span>
              <input
                type="date"
                value={form.departure_date}
                onChange={(e) => update("departure_date", e.target.value)}
                required
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-500">To <span className="text-slate-600">(optional)</span></span>
              <input
                type="date"
                value={form.departure_date_end ?? ""}
                onChange={(e) => update("departure_date_end", e.target.value || undefined)}
                min={form.departure_date || undefined}
                className={inputClasses}
              />
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Set a range to search the cheapest across multiple dates (max 15 days)
          </p>
        </div>

        {/* Trip Type toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">Trip Type</label>
          <div className="flex rounded-lg border border-slate-700/40 bg-slate-800/40 p-1">
            {(["one-way", "round-trip"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  update("trip_type", type);
                  if (type === "one-way") {
                    update("return_date", undefined);
                    update("return_date_end", undefined);
                  }
                  // For round-trip, return dates stay as-is
                }}
                className={segmentBtn(form.trip_type === type)}
              >
                {type === "one-way" ? "One Way" : "Round Trip"}
              </button>
            ))}
          </div>
        </div>

        {/* Return Date Range (only for round-trip) */}
        {form.trip_type === "round-trip" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">
              Return Dates<span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">From</span>
                <input
                  type="date"
                  value={form.return_date ?? ""}
                  onChange={(e) => update("return_date", e.target.value)}
                  required
                  min={form.departure_date_end || form.departure_date || undefined}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">To <span className="text-slate-600">(optional)</span></span>
                <input
                  type="date"
                  value={form.return_date_end ?? ""}
                  onChange={(e) => update("return_date_end", e.target.value || undefined)}
                  min={form.return_date || undefined}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stops */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">Stops</label>
          <div className="flex rounded-lg border border-slate-700/40 bg-slate-800/40 p-1">
            {STOP_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => update("max_stops", opt.value)}
                className={segmentBtn(form.max_stops === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => update("currency", e.target.value)}
            className={`${inputClasses} appearance-none`}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price / Deal Alert */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">
            Max Price / Deal Alert
          </label>
          <input
            type="number"
            value={form.max_price ?? ""}
            onChange={(e) =>
              update(
                "max_price",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="e.g. 7000"
            min={0}
            className={inputClasses}
          />
          <p className="text-xs text-slate-600">
            Get alerted when price drops below this amount
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3
                     text-sm font-semibold text-white
                     shadow-lg shadow-blue-500/15
                     transition-all
                     hover:bg-blue-500 hover:shadow-blue-500/25
                     active:scale-[0.98]"
        >
          {isEditing ? "Save Changes" : "Add Flight Watch"}
        </button>
      </form>
    </Modal>
  );
}
