"use client";

import { BadgeCheck, Heart, MessageCircle, Search, Sparkles } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "./app-store";
import { hapticImpact } from "@/lib/telegram";

type Tab = "matches" | "liked";

export function MatchesScreen() {
  const { matchesSorted, likedYou, getProfile, openChat, openMatchModal } = useApp();
  const [tab, setTab] = useState<Tab>("matches");
  const [query, setQuery] = useState("");

  const filteredMatches = useMemo(() => {
    if (!query.trim()) return matchesSorted;
    const q = query.toLowerCase();
    return matchesSorted.filter((m) => {
      const p = getProfile(m.profileId);
      return p?.name.toLowerCase().includes(q);
    });
  }, [matchesSorted, query, getProfile]);

  const filteredLiked = useMemo(() => {
    if (!query.trim()) return likedYou;
    const q = query.toLowerCase();
    return likedYou.filter((p) => p.name.toLowerCase().includes(q));
  }, [likedYou, query]);

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pb-2 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Лайки</h1>
        <p className="text-xs text-muted-foreground">
          Здесь начинаются разговоры
        </p>
      </header>

      <div className="px-5 pb-3">
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени"
            className="h-10 w-full rounded-full border border-border bg-secondary/60 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
          />
        </label>
      </div>

      <div className="px-5 pb-2">
        <div className="flex gap-1 rounded-full bg-secondary/60 p-1">
          <TabButton active={tab === "matches"} onClick={() => setTab("matches")}>
            <MessageCircle className="h-3.5 w-3.5" />
            Чаты
            {matchesSorted.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {matchesSorted.length}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "liked"} onClick={() => setTab("liked")}>
            <Heart className="h-3.5 w-3.5" />
            Лайкнули тебя
            {likedYou.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {likedYou.length}
              </span>
            )}
          </TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {tab === "matches" ? (
          <MatchesList matches={filteredMatches} onOpenChat={openChat} />
        ) : (
          <LikedYouList profiles={filteredLiked} onOpen={openMatchModal} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function MatchesList({
  matches,
  onOpenChat,
}: {
  matches: ReturnType<typeof useApp>["matchesSorted"];
  onOpenChat: (id: string) => void;
}) {
  const { getProfile } = useApp();

  if (matches.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="flex flex-col gap-1">
      {matches.map((match) => {
        const profile = getProfile(match.profileId);
        if (!profile) return null;
        const last = match.lastMessage;
        const time = last
          ? formatTime(last.createdAt)
          : formatTime(match.createdAt);
        const isFromMe = last?.authorId === "me";

        return (
          <li key={match.id}>
            <button
              type="button"
              onClick={() => {
                hapticImpact("light");
                onOpenChat(match.id);
              }}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-secondary/70 active:scale-[0.99]"
            >
              <ProfileAvatar profile={profile} className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="truncate font-semibold">{profile.name}</span>
                    {profile.verified && (
                      <BadgeCheck className="h-4 w-4 shrink-0 fill-sky-400 text-background" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[11px]",
                      match.unread > 0 ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      match.unread > 0
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {isFromMe && last && (
                      <span className="text-muted-foreground">Вы: </span>
                    )}
                    {last?.text ?? "Новый взаимный лайк — напиши первым 👋"}
                  </p>
                  {match.unread > 0 && (
                    <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {match.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ProfileAvatar({ profile, className }: { profile: any; className?: string }) {
  const [idx, setIdx] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const prev = () => setIdx((p) => (profile.photos?.length ? (p - 1 + profile.photos.length) % profile.photos.length : 0));
  const next = () => setIdx((p) => (profile.photos?.length ? (p + 1) % profile.photos.length : 0));

  return (
    <div className={className}>
      <div
        className="relative h-full w-full"
        onTouchStart={(e) => (touchStartRef.current = e.touches[0].clientX)}
        onTouchMove={(e) => (touchEndRef.current = e.touches[0].clientX)}
        onTouchEnd={() => {
          if (touchStartRef.current == null || touchEndRef.current == null) return;
          const d = touchEndRef.current - touchStartRef.current;
          if (d > 40) prev();
          else if (d < -40) next();
          touchStartRef.current = null;
          touchEndRef.current = null;
        }}
      >
        {profile.photos.map((p: any, i: number) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.id}
            src={p.url}
            alt={profile.name}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
              i === idx ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {profile.online && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-400" />
        )}
      </div>
    </div>
  );
}

function LikedYouList({
  profiles,
  onOpen,
}: {
  profiles: ReturnType<typeof useApp>["likedYou"];
  onOpen: (id: string) => void;
}) {
  if (profiles.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 pt-12 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Sparkles className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">Пока тихо</h2>
        <p className="text-sm text-muted-foreground">
          Когда кто-то тебя лайкнет, он появится здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          type="button"
          onClick={() => onOpen(profile.id)}
          className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
        >
          <ProfileCover profile={profile} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-2.5">
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              Лайкнула
            </span>
            {profile.online && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-black/40" />
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-2.5 text-left text-white">
            <div className="flex items-baseline gap-1">
              <span className="font-bold">{profile.name}</span>
              <span className="text-sm opacity-90">{profile.age}</span>
              {profile.verified && (
                <BadgeCheck className="h-3.5 w-3.5 fill-sky-400 text-white" />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ProfileCover({ profile, className }: { profile: any; className?: string }) {
  const [idx, setIdx] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const prev = () => setIdx((p) => (profile.photos?.length ? (p - 1 + profile.photos.length) % profile.photos.length : 0));
  const next = () => setIdx((p) => (profile.photos?.length ? (p + 1) % profile.photos.length : 0));

  return (
    <div
      className={className}
      onTouchStart={(e) => (touchStartRef.current = e.touches[0].clientX)}
      onTouchMove={(e) => (touchEndRef.current = e.touches[0].clientX)}
      onTouchEnd={() => {
        if (touchStartRef.current == null || touchEndRef.current == null) return;
        const d = touchEndRef.current - touchStartRef.current;
        if (d > 40) prev();
        else if (d < -40) next();
        touchStartRef.current = null;
        touchEndRef.current = null;
      }}
    >
      {profile.photos.map((p: any, i: number) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          src={p.url}
          alt={profile.name}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            i === idx ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 pt-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Heart className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-2 text-lg font-semibold">Лайков пока нет</h2>
      <p className="text-sm text-muted-foreground">
        Свайпай в ленте — лайки появятся здесь.
      </p>
    </div>
  );
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "вчера";
  }
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
