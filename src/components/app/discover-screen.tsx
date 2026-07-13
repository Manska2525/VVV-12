"use client";

import { Filter, RotateCcw, Sparkles, X, Heart, Star } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "./app-store";
import { SwipeCard } from "./swipe-card";
import { hapticImpact } from "@/lib/telegram";

export function DiscoverScreen() {
  const { deck, swipe, rewind, setFiltersOpen, swipes } = useApp();
  const [lastSwipedId, setLastSwipedId] = useState<string | null>(null);
  const [navOffset, setNavOffset] = useState(0);

  useEffect(() => setNavOffset(0), [deck.length]);

  const visible = useMemo(() => deck.slice(navOffset, navOffset + 3), [deck, navOffset]);
  const canRewind = Object.keys(swipes).length > 0 && lastSwipedId !== null;

  const handleSwipe = (profileId: string, direction: "like" | "pass" | "super") => {
    setLastSwipedId(profileId);
    swipe(profileId, direction);
    if (direction === "like") hapticImpact("medium");
    else if (direction === "super") hapticImpact("heavy");
    else hapticImpact("light");
  };

  const handleAction = (direction: "like" | "pass" | "super") => {
    const top = deck[0];
    if (!top) return;
    handleSwipe(top.id, direction);
  };

  const goNextProfile = () => {
    if (navOffset + 1 <= Math.max(0, deck.length - 1)) setNavOffset((s) => s + 1);
  };

  const goPrevProfile = () => {
    if (navOffset - 1 >= 0) setNavOffset((s) => s - 1);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 py-2">
        <div className="w-full text-center">
          <p className="text-xs text-muted-foreground">
            {deck.length > 0
              ? `${deck.length} ${pluralize(deck.length, ["профиль", "профиля", "профилей"])} рядом`
              : "Новых профилей пока нет"}
          </p>
        </div>
      </header>

      <div className="relative flex-1 px-4 py-0">
        {deck.length === 0 ? (
          <EmptyDeck />
        ) : (
          <div className="relative h-full w-full">
            {visible
              .slice(0)
              .reverse()
              .map((profile, idx) => {
                const stackIndex = visible.length - 1 - idx;
                return (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    stackIndex={stackIndex}
                    onLike={(id) => handleSwipe(id, "like")}
                    onSuper={(id) => handleSwipe(id, "super")}
                    onNextProfile={goNextProfile}
                    onPrevProfile={goPrevProfile}
                  />
                );
              })}
          </div>
        )}
      </div>

      {/* bottom action buttons removed per request */}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant,
  ariaLabel,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "ghost" | "star" | "super";
  ariaLabel: string;
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "h-16 w-16 bg-gradient-to-br from-primary to-pink-500 text-primary-foreground shadow-lg shadow-primary/40 hover:scale-105 active:scale-95",
    ghost:
      "h-12 w-12 border-2 border-rose-200 bg-card text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30",
    star:
      "h-11 w-11 border-2 border-amber-300 bg-card text-amber-500 hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-950/30",
    super:
      "h-14 w-14 bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center justify-center rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
        styles[variant]
      )}
    >
      {children}
    </button>
  );
}

function EmptyDeck() {
  const { setFiltersOpen } = useApp();
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Ты всех посмотрел(а)</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Расширь фильтры или загляни позже — новые профили появляются каждый день.
      </p>
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
      >
        <Filter className="h-4 w-4" />
        Изменить фильтры
      </button>
    </div>
  );
}

function pluralize(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
