"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "./app-store";
import type { Profile } from "@/lib/types";

const GENDERS: { value: Profile["gender"]; label: string }[] = [
  { value: "female", label: "Девушки" },
  { value: "male", label: "Парни" },
];


export function FiltersSheet() {
  const { filters, filtersOpen, setFiltersOpen, setFilters } = useApp();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (filtersOpen) setDraft(filters);
  }, [filtersOpen, filters]);

  const close = () => setFiltersOpen(false);

  const apply = () => {
    setFilters(draft);
    setFiltersOpen(false);
  };

  const toggleGender = (g: Profile["gender"]) => {
    setDraft((d) => ({
      ...d,
      lookingFor: d.lookingFor.includes(g)
        ? d.lookingFor.filter((x) => x !== g)
        : [...d.lookingFor, g],
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filters-title"
      className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-200",
        filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <button
        type="button"
        aria-label="Закрыть"
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex max-h-[88%] w-full max-w-md flex-col rounded-t-3xl bg-card shadow-2xl transition-transform duration-300 ease-out safe-bottom z-[10000]",
          filtersOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 id="filters-title" className="text-base font-bold">
            Фильтры
          </h2>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ageMin: 22,
                ageMax: 38,
                maxDistanceKm: 25,
                lookingFor: ["female", "male"],
                onlyVerified: false,
              })
            }
            className="text-xs font-semibold text-primary"
          >
            Сбросить
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Ищу</h3>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map(({ value, label }) => {
                const active = draft.lookingFor.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleGender(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Возраст</h3>
              <span className="text-sm font-semibold text-primary">
                {draft.ageMin} – {draft.ageMax}
              </span>
            </div>
            <DualRangeSlider
              min={18}
              max={60}
              valueMin={draft.ageMin}
              valueMax={draft.ageMax}
              onChange={(min, max) =>
                setDraft((d) => ({ ...d, ageMin: min, ageMax: max }))
              }
            />
          </section>

          <section className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Максимальное расстояние</h3>
              <span className="text-sm font-semibold text-primary">
                {draft.maxDistanceKm} км
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={draft.maxDistanceKm}
              onChange={(e) =>
                setDraft((d) => ({ ...d, maxDistanceKm: Number(e.target.value) }))
              }
              className="h-1.5 w-full appearance-none rounded-full bg-secondary accent-primary"
            />
          </section>

          {/* Интересы удалены */}

          <section className="mb-2">
            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({ ...d, onlyVerified: !d.onlyVerified }))
              }
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-background p-3.5 text-left"
            >
              <div>
                <div className="text-sm font-semibold">Только верифицированные</div>
                <div className="text-xs text-muted-foreground">
                  С подтверждённым фото
                </div>
              </div>
              <span
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                  draft.onlyVerified ? "bg-primary" : "bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform",
                    draft.onlyVerified ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>
          </section>
        </div>

        <div className="border-t border-border bg-card p-4">
          <button
            type="button"
            onClick={apply}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-95"
          >
            Показать результаты
          </button>
        </div>
      </div>
    </div>
  );
}

function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const span = max - min;
  const leftPct = ((valueMin - min) / span) * 100;
  const rightPct = ((valueMax - min) / span) * 100;

  return (
    <div className="relative h-8">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), valueMax - 1);
          onChange(v, valueMax);
        }}
        className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-md"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), valueMin + 1);
          onChange(valueMin, v);
        }}
        className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  );
}
