import { requireAuth } from "@/lib/dashboard-auth";
import { leadsConfigured, listLeads, type Lead } from "@/lib/leads";
import LeadsTable from "./LeadsTable";

// Always render fresh — a lead saved a second ago should show on refresh.
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  await requireAuth();

  // Before the owner creates the database, don't error — explain the one step.
  if (!leadsConfigured) {
    return (
      <div className="max-w-2xl">
        <Heading />
        <div className="mt-8 text-muted">
          <p className="text-ink">The leads database isn&apos;t connected yet.</p>
          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5">
            <li>In the Vercel dashboard, open this project and go to Storage.</li>
            <li>Create a free Postgres database and connect it to the project.</li>
            <li>Redeploy. Vercel adds the connection string automatically.</li>
          </ol>
          <p className="mt-4">
            Messages are still emailed in the meantime, so nothing is lost.
          </p>
        </div>
      </div>
    );
  }

  let leads: Lead[] = [];
  let failed = false;
  try {
    leads = await listLeads();
  } catch (err) {
    console.error("[leads] failed to load:", err);
    failed = true;
  }

  return (
    <div className="max-w-2xl">
      <Heading />
      {failed ? (
        <p className="mt-8 text-muted">
          Could not reach the database just now. Refresh in a moment. Messages are
          still being emailed, so nothing is lost.
        </p>
      ) : (
        <div className="mt-6">
          <LeadsTable leads={leads} />
        </div>
      )}
    </div>
  );
}

function Heading() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">leads</h1>
      <p className="mt-3 text-lg text-muted">
        Every message from the contact form, newest first. Click an email to reply.
      </p>
    </>
  );
}
