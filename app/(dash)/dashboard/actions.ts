"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/dashboard-auth";

export async function logout() {
  await endSession();
  redirect("/login");
}
