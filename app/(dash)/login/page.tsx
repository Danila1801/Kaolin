import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/dashboard-auth";
import LoginForm from "@/components/dashboard/LoginForm";

// Already signed in? Skip the form.
export default async function LoginPage() {
  if (await isAuthed()) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-forest">kaolin</span>
          <span className="text-sm text-muted">dashboard</span>
        </div>
        <p className="mt-2 text-muted">Enter the password to continue.</p>
        <LoginForm />
      </div>
    </div>
  );
}
