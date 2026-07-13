"use client";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramWebAppUser;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramWebAppThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    setText: (text: string) => void;
    enable: () => void;
    disable: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  showAlert: (message: string, cb?: () => void) => void;
  showConfirm: (message: string, cb?: (ok: boolean) => void) => void;
  onEvent: (event: string, cb: () => void) => void;
  offEvent: (event: string, cb: () => void) => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isTelegramEnvironment(): boolean {
  return getTelegramWebApp() !== null;
}

export function applyTelegramTheme(): void {
  const tg = getTelegramWebApp();
  if (!tg) return;

  const root = document.documentElement;
  const params = tg.themeParams;

  const set = (name: string, value: string | undefined) => {
    if (value) root.style.setProperty(name, value);
  };

  set("--tg-bg-color", params.bg_color);
  set("--tg-secondary-bg-color", params.secondary_bg_color);
  set("--tg-text-color", params.text_color);
  set("--tg-hint-color", params.hint_color);
  set("--tg-link-color", params.link_color);
  set("--tg-button-color", params.button_color);
  set("--tg-button-text-color", params.button_text_color);
  set("--tg-header-bg-color", params.header_bg_color);
  set("--tg-accent-text-color", params.accent_text_color);
  set("--tg-section-bg-color", params.section_bg_color);
  set("--tg-section-header-text-color", params.section_header_text_color);
  set("--tg-subtitle-text-color", params.subtitle_text_color);
  set("--tg-destructive-text-color", params.destructive_text_color);

  root.dataset.tgColorScheme = tg.colorScheme;
}

export function hapticImpact(style: "light" | "medium" | "heavy" = "light"): void {
  try {
    getTelegramWebApp()?.HapticFeedback.impactOccurred(style);
  } catch {}
}

export function hapticNotification(type: "error" | "success" | "warning" = "success"): void {
  try {
    getTelegramWebApp()?.HapticFeedback.notificationOccurred(type);
  } catch {}
}

export function hapticSelection(): void {
  try {
    getTelegramWebApp()?.HapticFeedback.selectionChanged();
  } catch {}
}
