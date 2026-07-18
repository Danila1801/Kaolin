"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/(dash)/login/actions";

// Client form. useActionState wires the form to the server action and gives us
// `pending` (true while checking) and any returned error to show inline.
export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Password"
        autoComplete="current-password"
        className="w-full rounded-lg border border-ink/15 bg-card px-4 py-3 text-ink outline-none transition-colors focus:border-forest"
      />
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-forest px-5 py-3 font-medium text-cream transition-colors hover:bg-pine disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
