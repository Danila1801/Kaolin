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
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");

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

    // Placeholder assistant message we fill in as tokens arrive.
    const assistantId = crypto.randomUUID();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
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
      {/* Launcher */}
      {!open && (
        <button
          ref={launcherRef}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="bg-ink text-cream fixed right-5 bottom-5 z-40 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          aria-label={t("launcher")}
        >
          {t("launcher")}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className="border-ink/10 bg-card fixed right-5 bottom-5 z-40 flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border shadow-xl"
        >
          <header className="border-ink/10 flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-display text-lg lowercase">{t("title")}</div>
              <div className="text-muted text-xs">{t("disclaimer")}</div>
            </div>
            <button
              onClick={close}
              aria-label={t("close")}
              className="text-muted hover:text-ink -mr-1 rounded-full p-2 text-lg leading-none transition-colors"
            >
              ×
            </button>
          </header>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-base"
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

          <div className="border-ink/10 flex items-end gap-2 border-t px-3 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              aria-label={t("title")}
              placeholder={t("placeholder")}
              className="text-ink placeholder:text-muted max-h-28 flex-1 resize-none bg-transparent px-1 py-2"
            />
            <button
              onClick={send}
              disabled={busy || input.trim().length === 0}
              className="bg-rust hover:bg-rust/90 rounded-full px-4 py-2 text-sm font-medium text-cream transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
