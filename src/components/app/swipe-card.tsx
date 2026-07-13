"use client";

import { BadgeCheck, MapPin, Heart, Star } from "lucide-react";
import { useEffect, useState, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface SwipeCardProps {
  profile: Profile;
  stackIndex: number;
  onLike?: (id: string) => void;
  onSuper?: (id: string) => void;
  onNextProfile?: () => void;
  onPrevProfile?: () => void;
}

export function SwipeCard({ profile, stackIndex, onLike, onSuper, onNextProfile, onPrevProfile }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    setPhotoIndex(0);
  }, [profile.id]);

  const prevPhoto = () => setPhotoIndex((p) => {
    if (!profile.photos?.length) return 0;
    return (p - 1 + profile.photos.length) % profile.photos.length;
  });
  const nextPhoto = () => setPhotoIndex((p) => {
    if (!profile.photos?.length) return 0;
    return (p + 1) % profile.photos.length;
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const startX = touchStartXRef.current;
    const endX = touchEndXRef.current;
    const threshold = 50;
    if (startX == null || endX == null) {
      touchStartXRef.current = null;
      return;
    }

    const deltaX = endX - startX;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) prevPhoto();
      else nextPhoto();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Remove any prerendered interest "chips" that may be present in cached HTML.
  // This is a client-side safeguard: if the server-served HTML still contains
  // interest buttons (due to stale SSG), remove them after mount so the UI
  // doesn't show interests in the feed.
  useEffect(() => {
    const el = document.getElementById(`profile-card-${profile.id}`);
    if (!el) return;
    const info = el.querySelector('.absolute.inset-x-0.bottom-0') || el;
    const candidates = Array.from(info.querySelectorAll('button,span,div')) as HTMLElement[];
    const KEYS = [
      "Путешествия",
      "Спорт",
      "Музыка",
      "Кино",
      "Книги",
      "Готовка",
      "Йога",
      "Фотография",
      "Танцы",
      "Игры",
      "Природа",
      "Искусство",
      "Технологии",
      "Настолки",
    ];
    candidates.forEach((c) => {
      const t = (c.textContent || '').trim();
      if (!t || t.length > 40) return;
      for (const k of KEYS) {
        if (t.includes(k)) {
          c.remove();
          break;
        }
      }
    });
  }, [profile.id]);

  const photo = profile.photos[photoIndex] ?? profile.photos[0];
  const style: CSSProperties = {
    transform: `scale(${1 - stackIndex * 0.03}) translateY(${stackIndex * 10}px)`,
    zIndex: 100 - stackIndex,
    opacity: 1 - stackIndex * 0.1,
  };

  return (
    <div
      id={`profile-card-${profile.id}`}
      className="absolute inset-0 select-none"
      style={style}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-black/5 dark:ring-white/5">
        {/* render layered photos with touch navigation */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {profile.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.url}
              alt={`${profile.name}, ${profile.age} ${i + 1}`}
              draggable={false}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out",
                i === photoIndex ? "opacity-100 translate-x-0 z-0" : "opacity-0 translate-x-4 z-0"
              )}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 z-10 flex gap-1.5 p-3 justify-center">
          {profile.photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Фото ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIndex(i);
              }}
              className={cn(
                "h-1.5 w-8 rounded-full transition-all",
                i === photoIndex ? "bg-white" : "bg-white/40"
              )}
            />
          ))}
        </div>

        {profile.online && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            онлайн
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

        {/* prev/next buttons */}
        {profile.photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        {/* Vertical action buttons (like, super) on right of photo, aligned near profile city */}
        <div className="absolute right-4 bottom-[5.5rem] z-30 flex items-center gap-3">
          <div className="relative">
            <span className="absolute -inset-2 rounded-full blur-3xl opacity-70 bg-pink-500/40 -z-10" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onLike?.(profile.id); }}
              aria-label="Нравится"
              className="z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-primary-foreground shadow-lg shadow-primary/40"
            >
              <Heart className="h-6 w-6 text-white" fill="currentColor" />
            </button>
          </div>

          <div className="relative">
            <span className="absolute -inset-2 rounded-full blur-3xl opacity-70 bg-sky-400/30 -z-10" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSuper?.(profile.id); }}
              aria-label="Супер-лайк"
              className="z-20 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/40"
            >
              <Star className="h-5 w-5 text-white" fill="currentColor" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 z-20 p-5 text-white">
          <div className="mb-1 flex items-end gap-2">
            <h2 className="text-3xl font-bold leading-none tracking-tight">
              {profile.name}
            </h2>
            <span className="text-2xl font-semibold leading-none opacity-90">
              {profile.age}
            </span>
            {profile.verified && (
              <BadgeCheck className="mb-1 h-5 w-5 fill-sky-400 text-white" />
            )}
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.city} · {profile.distanceKm} км
            </span>
          </div>
          <div className="max-h-[4.5rem] overflow-y-auto text-sm leading-snug text-white/85 pr-2">
            {profile.bio}
          </div>
        </div>
      </div>
    </div>
  );
}
