"use client";

import { Compass, Heart, User2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppStoreProvider, useApp, type Screen } from "./app-store";
import { DiscoverScreen } from "./discover-screen";
import { MatchesScreen } from "./matches-screen";
import { ProfileScreen } from "./profile-screen";
import { ChatScreen } from "./chat-screen";
import { MatchModal } from "./match-modal";
import { FiltersSheet } from "./filters-sheet";
import { EditProfileModal } from "./edit-profile-modal";
import { useTelegram } from "./telegram-provider";

const NAV_ITEMS: { id: Screen; label: string; icon: typeof Compass }[] = [
  { id: "discover", label: "Лента", icon: Compass },
  { id: "matches", label: "Матчи", icon: Heart },
  { id: "profile", label: "Профиль", icon: User2 },
];

function NavBar({
  active,
  onChange,
}: {
  active: Screen;
  onChange: (s: Screen) => void;
}) {
  const { totalUnread } = useApp();
  const { setFiltersOpen } = useApp();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl safe-bottom"
      role="tablist"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-1 pt-1.5">
        {/* Лента */}
        <button
          type="button"
          role="tab"
          aria-selected={active === "discover"}
          onClick={() => onChange("discover")}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
            active === "discover" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="relative">
            <Compass
              className={cn("h-[22px] w-[22px] transition-transform", active === "discover" && "scale-110")}
              strokeWidth={active === "discover" ? 2.4 : 1.8}
            />
          </span>
          <span>Лента</span>
          {active === "discover" && (
            <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </button>

        {/* Кнопка фильтров между Лента и Матчи */}
        <button
          type="button"
          aria-label="Фильтры"
          onClick={() => setFiltersOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-[22px] w-[22px]" />
          <span>Фильтры</span>
        </button>

        {/* Матчи */}
        <button
          type="button"
          role="tab"
          aria-selected={active === "matches"}
          onClick={() => onChange("matches")}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
            active === "matches" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="relative">
            <Heart
              className={cn("h-[22px] w-[22px] transition-transform", active === "matches" && "scale-110")}
              strokeWidth={active === "matches" ? 2.4 : 1.8}
            />
            {totalUnread > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </span>
          <span>Матчи</span>
          {active === "matches" && (
            <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </button>

        {/* Профиль */}
        <button
          type="button"
          role="tab"
          aria-selected={active === "profile"}
          onClick={() => onChange("profile")}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
            active === "profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User2
            className={cn("h-[22px] w-[22px] transition-transform", active === "profile" && "scale-110")}
            strokeWidth={active === "profile" ? 2.4 : 1.8}
          />
          <span>Профиль</span>
          {active === "profile" && (
            <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </button>
      </div>
    </nav>
  );
}

function ShellInner() {
  const [active, setActive] = useState<Screen>("discover");
  const { activeChatId, openChat, editProfileOpen, setEditProfileOpen } = useApp();
  const { webApp } = useTelegram();

  useEffect(() => {
    if (!webApp) return;
    const BackButton = webApp.BackButton;
    const handler = () => openChat(null);
    if (activeChatId) {
      BackButton.show();
      BackButton.onClick(handler);
      return () => BackButton.offClick(handler);
    } else {
      BackButton.hide();
    }
  }, [webApp, activeChatId, openChat]);

  // Client-side safeguard: remove any leftover interest "chips" that may be
  // present in prerendered/cached HTML across the app. Matches common tag
  // texts (e.g. "Путешествия", "Йога") and removes their nodes after mount.
  useEffect(() => {
    const INTEREST_KEYS = [
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

    const removeChips = () => {
      const els = Array.from(document.querySelectorAll('button,span,div')) as HTMLElement[];
      els.forEach((el) => {
        const t = (el.textContent || '').trim();
        if (!t) return;
        if (t.length > 40) return; // avoid removing large blocks
        for (const key of INTEREST_KEYS) {
          if (t.includes(key)) {
            el.remove();
            break;
          }
        }
      });
    };

    // Run once after mount and a short delay to allow hydration-produced nodes.
    removeChips();
    const timer = window.setTimeout(removeChips, 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className="relative flex-1 overflow-hidden">
        {activeChatId ? (
          <ChatScreen />
        ) : (
          <div
            key={active}
            className={cn(
              "absolute inset-0 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-200",
              active === "discover" ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            {active === "discover" && <DiscoverScreen />}
            {active === "matches" && <MatchesScreen />}
            {active === "profile" && <ProfileScreen />}
          </div>
        )}
      </main>
      <NavBar active={active} onChange={setActive} />
      <MatchModal />
      <FiltersSheet />
      <EditProfileModal open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </div>
  );
}

export function AppShell() {
  return (
    <AppStoreProvider>
      <ShellInner />
    </AppStoreProvider>
  );
}