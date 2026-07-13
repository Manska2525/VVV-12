"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyTelegramTheme,
  getTelegramWebApp,
  isTelegramEnvironment,
  type TelegramWebApp,
  type TelegramWebAppUser,
} from "@/lib/telegram";

interface TelegramContextValue {
  isReady: boolean;
  isTelegram: boolean;
  webApp: TelegramWebApp | null;
  user: TelegramWebAppUser | null;
  colorScheme: "light" | "dark";
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  isTelegram: false,
  webApp: null,
  user: null,
  colorScheme: "light",
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);

  const init = useCallback(() => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      setIsReady(true);
      return;
    }

    try {
      webApp.ready();
      webApp.expand();
      applyTelegramTheme();
      setUser(webApp.initDataUnsafe?.user ?? null);
      setColorScheme(webApp.colorScheme === "dark" ? "dark" : "light");

      webApp.onEvent("themeChanged", () => {
        applyTelegramTheme();
        setColorScheme(webApp.colorScheme === "dark" ? "dark" : "light");
      });
    } catch (err) {
      console.warn("Telegram WebApp init failed:", err);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isTelegramEnvironment()) {
      init();
      return;
    }

    const interval = window.setInterval(() => {
      if (isTelegramEnvironment()) {
        window.clearInterval(interval);
        init();
      }
    }, 200);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setIsReady(true);
    }, 2000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [init]);

  useEffect(() => {
    if (!colorScheme) return;
    const root = document.documentElement;
    const wantDark = colorScheme === "dark";
    const hasDark = root.classList.contains("dark");
    if (wantDark && !hasDark) root.classList.add("dark");
    if (!wantDark && hasDark) root.classList.remove("dark");
  }, [colorScheme]);

  const value = useMemo<TelegramContextValue>(
    () => ({
      isReady,
      isTelegram: typeof window !== "undefined" && isTelegramEnvironment(),
      webApp: typeof window !== "undefined" ? getTelegramWebApp() : null,
      user,
      colorScheme,
    }),
    [isReady, user, colorScheme]
  );

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
