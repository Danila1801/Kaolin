import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl", "ro", "ru"],
  defaultLocale: "en",
});
