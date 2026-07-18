import { requireAuth } from "@/lib/dashboard-auth";

// Small honest status list so the dashboard shows what works today and what is
// coming next, instead of pretending the empty tabs are broken.
const ROADMAP: { title: string; note: string; done: boolean }[] = [
  { title: "Private login", note: "Only the password gets in. You are looking at it.", done: true },
  { title: "Leads", note: "Every contact form message, saved and listed here.", done: false },
  { title: "Chats", note: "Read the conversations visitors had with the bot.", done: false },
  { title: "Traffic", note: "Visitors, top pages, language, country.", done: false },
  { title: "Tasks", note: "A shared to do / doing / done board for you and dad.", done: false },
];

export default async function OverviewPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">welcome back</h1>
      <p className="mt-3 text-lg text-muted">
        This is your private control room. Only people with the password can see
        it. Here is what is live and what is coming next.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {ROADMAP.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span
              aria-hidden
              className={
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold " +
                (item.done
                  ? "bg-forest text-cream"
                  : "bg-forest/10 text-forest/50")
              }
            >
              {item.done ? "✓" : ""}
            </span>
            <div>
              <p className="font-medium text-ink">
                {item.title}
                {!item.done && (
                  <span className="ml-2 text-[0.65rem] uppercase tracking-wide text-muted/60">
                    soon
                  </span>
                )}
              </p>
              <p className="text-muted">{item.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
