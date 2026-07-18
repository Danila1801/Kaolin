"use client";

import { useMemo, useState } from "react";
import type { Lead } from "@/lib/leads";

// Deterministic date formatting: an explicit timeZone makes the output identical
// on the server and in the browser, so there's no hydration mismatch. Amsterdam
// is where dad reads these, so show them in his time.
const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState("");

  // Client-side search by name or email. The list is small (capped at 1000), so
  // filtering in the browser is instant and needs no server round-trip.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q),
    );
  }, [leads, query]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          aria-label="Search leads by name or email"
          className="w-full max-w-xs border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-forest sm:w-auto"
        />
        <span className="text-sm text-muted">
          {filtered.length} of {leads.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-muted">
          {leads.length === 0
            ? "No messages yet. The next contact form submission will show up here."
            : "No messages match that search."}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col">
          {filtered.map((lead) => (
            <li
              key={lead.id}
              className="border-b border-ink/10 py-5 first:border-t"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-medium text-ink">{lead.name}</p>
                <time
                  dateTime={lead.created_at}
                  className="text-sm text-muted"
                >
                  {fmt.format(new Date(lead.created_at))}
                </time>
              </div>
              <a
                href={`mailto:${lead.email}`}
                className="text-sm text-forest underline-offset-2 hover:underline"
              >
                {lead.email}
              </a>
              <p className="mt-2 whitespace-pre-wrap text-ink">{lead.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
