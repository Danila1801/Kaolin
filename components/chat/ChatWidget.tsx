"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

type Status = "idle" | "streaming" | "error" | "rate_limited";

// The floating assistant. Editorial and calm on purpose — a card-colored panel,
// ink text, a single rust accent. No gradients, no glowing orb, no bounce.
export default function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // One id per widget session, so every turn of one conversation lands in the
  // same row in the dashboard's Chats tab instead of scattering across many.
  // Lazily generated (not on mount) so a visitor who never opens the widget
  // never allocates one.
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  // First-visit attention cue: a one-time "try me" bubble + pulse ring. Shown
  // once per browser (localStorage), and never when the user prefers reduced
  // motion carries the pulse.
  const [hint, setHint] = useState(false);
  const [reduced, setReduced] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const busy = status === "streaming";

  // Keep the transcript pinned to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  // Close and return focus to the launcher, so a keyboard user isn't dumped at
  // the top of the document when the dialog goes away.
  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  // Surface the first-visit cue a beat after load, then retire it on its own so
  // it never lingers. Skipped entirely for return visitors.
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let seen = false;
    try {
      seen = !!localStorage.getItem("kaolin.chatHintSeen");
    } catch {
      /* storage blocked — just show the cue this once */
    }
    if (seen) return;
    const show = window.setTimeout(() => setHint(true), 1200);
    const hide = window.setTimeout(() => setHint(false), 8500);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  // Retire the cue for good on the first real interaction with the launcher.
  function retireHint() {
    setHint(false);
    try {
      localStorage.setItem("kaolin.chatHintSeen", "1");
    } catch {
      /* storage blocked — nothing to persist */
    }
  }

  function openChat() {
    retireHint();
    setOpen(true);
  }

  // While open: focus the input, close on Escape, and trap Tab inside the panel
  // so keyboard focus can't wander to the page behind the dialog and get lost.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStatus("streaming");

    const conversationId = chatId ?? crypto.randomUUID();
    if (!chatId) setChatId(conversationId);

    // Placeholder assistant message we fill in as tokens arrive.
    const assistantId = crypto.randomUUID();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          chatId: conversationId,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (res.status === 429) {
        setMessages((m) => m.filter((msg) => msg.id !== assistantId));
        setStatus("rate_limited");
        return;
      }
      if (!res.ok || !res.body) {
        setMessages((m) => m.filter((msg) => msg.id !== assistantId));
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, content: acc } : msg)),
        );
      }
      setStatus("idle");
    } catch {
      setMessages((m) => m.filter((msg) => msg.id !== assistantId));
      setStatus("error");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Launcher — a present, on-brand emerald pill (the assistant is the whole
          differentiator, so it shouldn't hide). A first-visit cue nudges toward it. */}
      {!open && (
        <div className="fixed right-5 bottom-5 z-40 flex items-center gap-2.5">
          {hint && (
            <span
              role="status"
              className="chat-hint-bubble bg-card text-ink ring-ink/10 pointer-events-none rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap shadow-md ring-1 select-none"
            >
              {t("hint")}
            </span>
          )}
          <span className="relative inline-flex">
            {hint && !reduced && (
              <span
                aria-hidden="true"
                className="chat-launcher-ping pointer-events-none absolute inset-0 rounded-full"
              />
            )}
            <button
              ref={launcherRef}
              onClick={openChat}
              onMouseEnter={retireHint}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={t("launcher")}
              className="bg-forest text-cream ring-cream/25 hover:bg-pine relative inline-flex items-center gap-3 rounded-full px-7 py-4 text-[1.12rem] font-semibold whitespace-nowrap shadow-lg ring-1 transition-[transform,background-color] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-[1.4rem] w-[1.4rem]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 20l1.4-4.2a8.38 8.38 0 0 1-.9-4A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" />
              </svg>
              {t("launcher")}
            </button>
          </span>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className="border-ink/10 bg-card fixed right-5 bottom-5 z-40 flex h-[min(80vh,680px)] w-[min(94vw,440px)] flex-col overflow-hidden rounded-2xl border shadow-xl"
        >
          <header className="border-ink/10 flex items-center justify-between border-b px-5 py-4">
            <div>
              <div className="font-display text-xl lowercase">{t("title")}</div>
              <div className="text-muted text-sm">{t("disclaimer")}</div>
            </div>
            <button
              onClick={close}
              aria-label={t("close")}
              className="text-muted hover:text-ink -mr-1 rounded-full p-2 text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </header>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-lg"
          >
            {messages.length === 0 && (
              <p className="text-muted">{t("intro")}</p>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "bg-rust/10 text-ink max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2"
                      : "text-ink max-w-[92%] whitespace-pre-wrap"
                  }
                >
                  {m.content ||
                    (busy && m.role === "assistant" ? (
                      <span className="text-muted inline-flex gap-1">
                        <span className="animate-pulse">•</span>
                        <span className="animate-pulse [animation-delay:150ms]">•</span>
                        <span className="animate-pulse [animation-delay:300ms]">•</span>
                      </span>
                    ) : null)}
                </div>
              </div>
            ))}

            {status === "rate_limited" && (
              <p className="text-rust text-sm">{t("rateLimited")}</p>
            )}
            {status === "error" && (
              <p className="text-rust text-sm">{t("error")}</p>
            )}
          </div>

          <div className="border-ink/10 flex items-end gap-2 border-t px-4 py-4">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              aria-label={t("title")}
              placeholder={t("placeholder")}
              className="text-ink placeholder:text-muted max-h-32 flex-1 resize-none bg-transparent px-1 py-2 text-lg"
            />
            <button
              onClick={send}
              disabled={busy || input.trim().length === 0}
              className="bg-forest hover:bg-forest/90 rounded-full px-5 py-2.5 text-base font-medium text-cream transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
