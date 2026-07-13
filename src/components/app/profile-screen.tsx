"use client";

import {
  Bell,
  ChevronRight,
  Eye,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Pencil,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  User2,
} from "lucide-react";
import { useTelegram } from "./telegram-provider";
import { useState, useRef } from "react";
import { useApp } from "./app-store";
import { cn } from "@/lib/utils";

export function ProfileScreen() {
  const { user, isTelegram } = useTelegram();
  const { matchesSorted, setFiltersOpen, swipes, setEditProfileOpen } = useApp();

  const stats = [
    { label: "Лайков", value: Object.values(swipes).filter((s) => s.direction !== "pass").length, icon: Heart, color: "text-rose-500 bg-rose-500/10" },
    { label: "Лайки", value: matchesSorted.length, icon: Sparkles, color: "text-amber-500 bg-amber-500/10" },
    { label: "Просмотров", value: 142, icon: Eye, color: "text-sky-500 bg-sky-500/10" },
  ];

  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Алекс";
  const username = user?.username ? `@${user.username}` : "@alex_spark";

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pb-2 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <section className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-pink-500 to-rose-500 p-5 text-white shadow-lg shadow-primary/30">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white/30">
              {user?.photos?.length ? (
                <ProfileAvatarSmall photos={user.photos} alt={name} />
              ) : user?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photo_url}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20 text-2xl font-bold">
                  {name.charAt(0)}
                </div>
              )}
              <button
                type="button"
                aria-label="Редактировать фото"
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-foreground shadow-md"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold">{name}</h2>
              <p className="truncate text-sm text-white/85">{username}</p>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-white/85">
                <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                <span>Premium · до 12.06</span>
              </div>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur"
              >
                <s.icon className="mb-1 h-4 w-4" />
                <div className="text-lg font-bold leading-none">{s.value}</div>
                <div className="text-[11px] text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <Section title="Настройки поиска">
          <Item
            icon={SlidersHorizontal}
            iconClass="text-primary bg-primary/10"
            title="Фильтры"
            subtitle="Возраст, расстояние"
            onClick={() => setFiltersOpen(true)}
          />
          <Item
            icon={MapPin}
            iconClass="text-emerald-500 bg-emerald-500/10"
            title="Местоположение"
            subtitle="Москва · обновлять автоматически"
            right={<Switch defaultChecked />}
          />
          <Item
            icon={Eye}
            iconClass="text-sky-500 bg-sky-500/10"
            title="Режим инкогнито"
            subtitle="Скрывать профиль от тех, кого ты не лайкнул(а)"
            right={<Switch />}
          />
        </Section>

        <Section title="Аккаунт">
          <Item
            icon={User2}
            iconClass="text-violet-500 bg-violet-500/10"
            title="Редактировать анкету"
            subtitle="Фото, био"
            onClick={() => setEditProfileOpen(true)}
          />
          <Item
            icon={Shield}
            iconClass="text-indigo-500 bg-indigo-500/10"
            title="Верификация"
            subtitle="Подтвердить фото для значка"
            right={<Badge>Доступно</Badge>}
          />
          <Item
            icon={Bell}
            iconClass="text-amber-500 bg-amber-500/10"
            title="Уведомления"
            subtitle="Звук, вибрация, без звука"
          />
        </Section>

        <Section title="Поддержка">
          <Item icon={HelpCircle} iconClass="text-cyan-500 bg-cyan-500/10" title="Помощь" />
          <Item
            icon={Settings}
            iconClass="text-slate-500 bg-slate-500/10"
            title="Конфиденциальность"
          />
          <Item
            icon={LogOut}
            iconClass="text-rose-500 bg-rose-500/10"
            title="Выйти"
            destructive
          />
        </Section>

        {!isTelegram && (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-3 text-center text-[11px] text-muted-foreground">
            Превью режима. В Telegram появятся живые данные и кнопка «Поделиться».
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Spark v1.0 · сделано с любовью к Telegram
        </p>
      </div>
    </div>
  );
}

function ProfileAvatarSmall({ photos, alt }: { photos: any[]; alt?: string }) {
  const [idx, setIdx] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const prev = () => setIdx((p) => (photos?.length ? (p - 1 + photos.length) % photos.length : 0));
  const next = () => setIdx((p) => (photos?.length ? (p + 1) % photos.length : 0));

  return (
    <div
      className="h-full w-full"
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
      {photos.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id || i}
          src={p.url || p}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-200", i === idx ? "opacity-100" : "opacity-0")}
        />
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

function Item({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  right,
  destructive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        onClick && "hover:bg-secondary/60 active:bg-secondary"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          iconClass
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-medium", destructive && "text-destructive")}>
          {title}
        </div>
        {subtitle && (
          <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </Wrapper>
  );
}

function Switch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        defaultChecked ? "bg-primary" : "bg-secondary"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform",
          defaultChecked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
      {children}
    </span>
  );
}
