"use client";

import { Compass, Heart, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppStoreProvider, useApp, type Screen } from "./app-store";
import { DiscoverScreen } from "./discover-screen";
import { MatchesScreen } from "./matches-screen";
import { ProfileScreen } from "./profile-screen";
import { ChatScreen } from "./chat-screen";
import { MatchModal } from "./match-modal";
import { FiltersSheet } from "./filters-sheet";
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

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl safe-bottom"
      role="tablist"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-1 pt-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative">
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-transform",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {id === "matches" && totalUnread > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </span>
              <span>{label}</span>
              {isActive && (
                <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ShellInner() {
  const [active, setActive] = useState<Screen>("discover");
  const { activeChatId, openChat } = useApp();
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