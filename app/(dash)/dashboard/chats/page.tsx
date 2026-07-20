import { requireAuth } from "@/lib/dashboard-auth";
import { chatsConfigured, listChats, type Chat } from "@/lib/chats";
import ChatsTable from "./ChatsTable";

// Always render fresh — a conversation from a minute ago should show on refresh.
export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  await requireAuth();

  if (!chatsConfigured) {
    return (
      <div className="max-w-2xl">
        <Heading />
        <div className="mt-8 text-muted">
          <p className="text-ink">The chats database isn&apos;t connected yet.</p>
          <p className="mt-4">
            This uses the same database as Leads. If Leads already works, this
            will too as soon as a visitor has a conversation with the assistant.
          </p>
        </div>
      </div>
    );
  }

  let chats: Chat[] = [];
  let failed = false;
  try {
    chats = await listChats();
  } catch (err) {
    console.error("[chats] failed to load:", err);
    failed = true;
  }

  return (
    <div className="max-w-2xl">
      <Heading />
      {failed ? (
        <p className="mt-8 text-muted">
          Could not reach the database just now. Refresh in a moment.
        </p>
      ) : (
        <div className="mt-6">
          <ChatsTable chats={chats} />
        </div>
      )}
    </div>
  );
}

function Heading() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">chats</h1>
      <p className="mt-3 text-lg text-muted">
        Every conversation a visitor had with the assistant, newest first.
        Click one to read the full exchange.
      </p>
    </>
  );
}
