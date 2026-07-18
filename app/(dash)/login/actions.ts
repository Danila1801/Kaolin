"use server";

import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/dashboard-auth";

export type LoginState = { error?: string } | undefined;

// Called by the login form. Runs only on the server, so the real password never
// reaches the browser. On success it sets the session cookie and redirects in.
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Wrong password." };
  }
  await startSession();
  redirect("/dashboard");
}
