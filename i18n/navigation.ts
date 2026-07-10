import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-ins for next/link and next/navigation.
// Always import Link/useRouter/usePathname from here, not from "next/*",
// so the /en|/nl|/ro|/ru prefix is handled automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
