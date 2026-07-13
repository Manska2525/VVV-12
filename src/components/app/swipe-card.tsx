"use client";

import { BadgeCheck, MapPin, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Profile, SwipeDirection } from "@/lib/types";

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 0.5;

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: SwipeDirection) => void;
  isTop: boolean;
  stackIndex: number;
}

export function SwipeCard({ profile, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exit, setExit] = useState<SwipeDirection | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    setExit(null);
    setPhotoIndex(0);
  }, [profile.id]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isTop || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setDrag({ x: dx, y: dy });
  };

  const finishSwipe = (direction: SwipeDirection | null) => {
    if (!direction) {
      setDrag({ x: 0, y: 0 });
      startRef.current = null;
      return;
    }
    setExit(direction);
    window.setTimeout(() => onSwipe(direction), 220);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isTop || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const dt = Math.max(1, Date.now() - startRef.current.t);
    const vx = Math.abs(dx) / dt;
    const vy = Math.abs(dy) / dt;

    let direction: SwipeDirection | null = null;
    if (dx > SWIPE_THRESHOLD || (vx > VELOCITY_THRESHOLD && dx > 0 && Math.abs(dx) > Math.abs(dy))) {
      direction = "like";
    } else if (dx < -SWIPE_THRESHOLD || (vx > VELOCITY_THRESHOLD && dx < 0 && Math.abs(dx) > Math.abs(dy))) {
      direction = "pass";
    } else if (dy < -SWIPE_THRESHOLD || (vy > VELOCITY_THRESHOLD && dy < 0 && Math.abs(dy) > Math.abs(dx))) {
      direction = "super";
    }

    finishSwipe(direction);
  };

  const handlePointerCancel = () => {
    if (!isTop) return;
    finishSwipe(null);
  };

  const rotation = drag.x * 0.06;
  const likeOpacity = Math.min(1, Math.max(0, drag.x / 90));
  const passOpacity = Math.min(1, Math.max(0, -drag.x / 90));
  const superOpacity = Math.min(1, Math.max(0, -drag.y / 90));

  const animationClass = exit
    ? exit === "like"
      ? "animate-card-out-right"
      : exit === "pass"
        ? "animate-card-out-left"
        : "animate-card-out-up"
    : isTop
      ? ""
      : "animate-card-in";

  const style: React.CSSProperties = isTop
    ? {
        transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotation}deg)`,
        transition: drag.x === 0 && drag.y === 0 ? "transform 0.25s ease" : "none",
        zIndex: 100 - stackIndex,
        opacity: 1,
      }
    : {
        transform: `scale(${1 - stackIndex * 0.04}) translateY(${stackIndex * 10}px)`,
        zIndex: 100 - stackIndex,
        opacity: 1 - stackIndex * 0.15,
        pointerEvents: "none",
      };

  const photo = profile.photos[photoIndex] ?? profile.photos[0];

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-0 select-none",
        isTop ? "touch-none" : "pointer-events-none",
        animationClass
      )}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-black/5 dark:ring-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={`${profile.name}, ${profile.age}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div className="absolute inset-x-0 top-0 z-10 flex gap-1.5 p-3">
          {profile.photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Фото ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isTop) setPhotoIndex(i);
              }}
              className={cn(
                "h-1 flex-1 rounded-full bg-white/40 transition-colors",
                i === photoIndex && "bg-white"
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

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

        {/* Stamp overlays */}
        <div
          className="pointer-events-none absolute left-6 top-16 z-20 -rotate-12 rounded-lg border-4 border-emerald-400 px-3 py-1 text-2xl font-black uppercase tracking-widest text-emerald-400 transition-opacity"
          style={{ opacity: likeOpacity }}
        >
          Like
        </div>
        <div
          className="pointer-events-none absolute right-6 top-16 z-20 rotate-12 rounded-lg border-4 border-rose-400 px-3 py-1 text-2xl font-black uppercase tracking-widest text-rose-400 transition-opacity"
          style={{ opacity: passOpacity }}
        >
          Pass
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-12 z-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-4 py-1.5 text-base font-black uppercase tracking-widest text-white shadow-lg transition-opacity"
          style={{ opacity: superOpacity }}
        >
          ✦ Super Like
        </div>

        {/* Profile info */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white">
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
            {profile.height && (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                {profile.height} см
              </span>
            )}
            {profile.occupation && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                {profile.occupation}
              </span>
            )}
          </div>
          <p className="line-clamp-3 text-sm leading-snug text-white/85">
            {profile.bio}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur"
              >
                {tag}
              </span>
            ))}
            {profile.interests.length > 4 && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
                +{profile.interests.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
