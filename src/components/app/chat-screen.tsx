"use client";

import { ArrowLeft, BadgeCheck, MoreVertical, Send, Smile } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "./app-store";
import { hapticImpact } from "@/lib/telegram";

const QUICK_REPLIES = [
  "Привет! Как день?",
  "Расскажи о себе 🙃",
  "Что планируешь на выходные?",
  "Какая у тебя суперсила?",
];

export function ChatScreen() {
  const { activeChatId, getMatch, getProfile, messages, sendMessage, markRead, openChat } =
    useApp();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const match = activeChatId ? getMatch(activeChatId) : undefined;
  const profile = match ? getProfile(match.profileId) : undefined;
  const list = activeChatId ? messages[activeChatId] ?? [] : [];

  useEffect(() => {
    if (activeChatId) markRead(activeChatId);
  }, [activeChatId, markRead]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [list.length, activeChatId]);

  if (!match || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Чат не найден</p>
      </div>
    );
  }

  const handleSend = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !activeChatId) return;
    sendMessage(activeChatId, trimmed);
    setText("");
    hapticImpact("light");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur safe-top">
        <button
          type="button"
          onClick={() => openChat(null)}
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.photos[0].url}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
          {profile.online && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-semibold">{profile.name}</span>
            {profile.verified && (
              <BadgeCheck className="h-4 w-4 fill-sky-400 text-background" />
            )}
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {profile.online ? "в сети" : profile.lastSeen ?? "был(а) недавно"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Меню"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-secondary"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-secondary/30 to-background px-3 py-4"
      >
        <div className="mx-auto mb-4 flex max-w-xs flex-col items-center gap-1 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.photos[0].url}
            alt={profile.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40"
          />
          <p className="text-sm font-semibold">Вы с {profile.name} понравились друг другу</p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(match.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="mx-auto flex max-w-md flex-col gap-1.5">
          {list.length === 0 ? (
            <div className="my-2 flex flex-wrap justify-center gap-1.5">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : (
            list.map((msg, i) => {
              const mine = msg.authorId === "me";
              const prev = list[i - 1];
              const grouped = prev?.authorId === msg.authorId;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    mine ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[78%] px-3.5 py-2 text-sm shadow-sm",
                      mine
                        ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-2xl rounded-bl-md bg-card text-foreground ring-1 ring-border/50",
                      grouped && (mine ? "rounded-tr-md" : "rounded-tl-md")
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words leading-snug">
                      {msg.text}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-[10px]",
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {list.length > 0 && list.length < 3 && (
            <div className="my-2 flex flex-wrap justify-center gap-1.5">
              {QUICK_REPLIES.slice(0, 2).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(text);
        }}
        className="border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur safe-bottom"
      >
        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label="Эмодзи"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <Smile className="h-5 w-5" />
          </button>
          <div className="flex-1 rounded-2xl bg-secondary/70 px-3 py-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(text);
                }
              }}
              placeholder="Сообщение…"
              rows={1}
              className="block max-h-32 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Отправить"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
              text.trim()
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
