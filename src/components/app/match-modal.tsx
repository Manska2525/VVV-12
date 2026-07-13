"use client";

import { MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "./app-store";
import { hapticNotification } from "@/lib/telegram";

const CONFETTI_COLORS = [
  "bg-rose-500",
  "bg-amber-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-violet-500",
  "bg-pink-400",
];

export function MatchModal() {
  const { matchModalProfileId, getProfile, openMatchModal, openChat } = useApp();
  const [closing, setClosing] = useState(false);

  const profile = matchModalProfileId ? getProfile(matchModalProfileId) : undefined;
  const visible = !!profile && !closing;

  useEffect(() => {
    if (matchModalProfileId) {
      setClosing(false);
      hapticNotification("success");
    }
  }, [matchModalProfileId]);

  const close = () => {
    setClosing(true);
    window.setTimeout(() => {
      openMatchModal(null);
      setClosing(false);
    }, 200);
  };

  if (!profile) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-6 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <button
        type="button"
        aria-label="Закрыть"
        onClick={close}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {visible && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "absolute top-0 h-2 w-2 rounded-sm",
                CONFETTI_COLORS[i % CONFETTI_COLORS.length]
              )}
              style={{
                left: `${(i * 4.2) % 100}%`,
                animation: `confetti-fall ${1.6 + (i % 5) * 0.2}s ${(i % 7) * 0.15}s cubic-bezier(0.2, 0.6, 0.4, 1) forwards`,
                ["--tx" as string]: `${(i % 2 === 0 ? -1 : 1) * (20 + (i % 6) * 12)}vw`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl bg-card p-6 shadow-2xl",
          visible ? "animate-match-pop" : "scale-95 opacity-0"
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-secondary/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-1 flex items-center gap-1.5 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Это матч!
          </span>
          <Sparkles className="h-4 w-4" />
        </div>
        <h2
          id="match-title"
          className="mb-5 text-center text-2xl font-bold leading-tight"
        >
          Вы с {profile.name} понравились друг другу
        </h2>

        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -left-2 top-1/2 h-20 w-20 -translate-y-1/2 overflow-hidden rounded-full border-4 border-card shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/me.webp"
              alt="Вы"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="absolute -right-2 top-1/2 h-20 w-20 -translate-y-1/2 overflow-hidden rounded-full border-4 border-card shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.photos[0].url}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="h-24 w-24" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-2xl shadow-lg shadow-primary/40">
              ❤️
            </span>
          </div>
        </div>

        <p className="mb-5 text-center text-sm text-muted-foreground">
          Напишите первым — хорошее начало это половина успеха.
        </p>

        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              const matchId = `m_${profile.id}`;
              openMatchModal(null);
              openChat(matchId);
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            Написать сообщение
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
          >
            Продолжить свайпать
          </button>
        </div>
      </div>
    </div>
  );
}
