"use client";

import { useMemo, useState } from "react";
import type { Chat } from "@/lib/chats";

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

function firstUserLine(chat: Chat): string {
  const first = chat.messages.find((m) => m.role === "user");
  return first?.content.slice(0, 140) ?? "(no message)";
}

export default function ChatsTable({ chats }: { chats: Chat[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Search across the full transcript text, not just the preview line, so a
  // question buried three turns in is still findable.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) =>
      c.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [chats, query]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversation text"
          aria-label="Search chats by content"
          className="w-full max-w-xs border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-forest sm:w-auto"
        />
        <span className="text-sm text-muted">
          {filtered.length} of {chats.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-muted">
          {chats.length === 0
            ? "No conversations yet. The next visitor who chats with the assistant will show up here."
            : "No conversations match that search."}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col">
          {filtered.map((chat) => {
            const isOpen = openId === chat.id;
            return (
              <li key={chat.id} className="border-b border-ink/10 py-4 first:border-t">
                <button
                  onClick={() => setOpenId(isOpen ? null : chat.id)}
                  aria-expanded={isOpen}
                  className="flex w-full flex-col items-start gap-1 text-left"
                >
                  <div className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-ink">{firstUserLine(chat)}</p>
                    <time dateTime={chat.updated_at} className="shrink-0 text-sm text-muted">
                      {fmt.format(new Date(chat.updated_at))}
                    </time>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                    <span>{chat.locale.toUpperCase()}</span>
                    <span>
                      {chat.turn_count} turn{chat.turn_count === 1 ? "" : "s"}
                    </span>
                    <span>
                      {chat.grounded_turns > 0
                        ? `grounded ${chat.grounded_turns}/${chat.turn_count}`
                        : "not grounded"}
                    </span>
                    <span>~{chat.total_tokens} tokens</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 flex flex-col gap-3 border-l-2 border-ink/10 pl-4">
                    {chat.messages.map((m, i) => (
                      <div key={i}>
                        <p className="text-xs uppercase tracking-wide text-muted/70">
                          {m.role === "user" ? "visitor" : "assistant"}
                        </p>
                        <p className="whitespace-pre-wrap text-ink">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
