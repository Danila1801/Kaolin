import { defineConfig } from "tinacms";
import type { Collection, TinaField } from "tinacms";

// Shared field builders. next-intl keeps each locale in its own file
// (messages/{locale}.json) with the same nested shape, so every locale
// gets an identical field tree — only the matched file differs.
const sectionFields = (): TinaField[] => [
  // hero
  {
    type: "object" as const,
    name: "hero",
    label: "Hero",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "subtitle", label: "Subtitle" },
    ],
  },
  // trust strip
  {
    type: "object" as const,
    name: "trust",
    label: "Trust Strip",
    fields: [{ type: "string" as const, name: "line", label: "Line" }],
  },
  // services
  {
    type: "object" as const,
    name: "services",
    label: "Services",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "intro", label: "Intro" },
      {
        type: "object" as const,
        name: "items",
        label: "Services",
        list: true,
        ui: {
          itemProps: (item: { name?: string }) => ({
            label: item?.name || "New Service",
          }),
        },
        fields: [
          { type: "string" as const, name: "name", label: "Name" },
          { type: "string" as const, name: "body", label: "Description" },
        ],
      },
    ],
  },
  // work
  {
    type: "object" as const,
    name: "work",
    label: "Work",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "intro", label: "Intro" },
      {
        type: "object" as const,
        name: "items",
        label: "Work Items",
        list: true,
        ui: {
          itemProps: (item: { name?: string }) => ({
            label: item?.name || "New Work Item",
          }),
        },
        fields: [
          { type: "string" as const, name: "name", label: "Name" },
          { type: "string" as const, name: "tag", label: "Tag (optional)" },
          { type: "string" as const, name: "body", label: "Description" },
          { type: "string" as const, name: "cta", label: "CTA Text" },
          { type: "string" as const, name: "href", label: "Link" },
        ],
      },
      { type: "string" as const, name: "note", label: "Note" },
    ],
  },
  // process
  {
    type: "object" as const,
    name: "process",
    label: "Process",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "intro", label: "Intro" },
      {
        type: "object" as const,
        name: "items",
        label: "Steps",
        list: true,
        ui: {
          itemProps: (item: { name?: string }) => ({
            label: item?.name || "New Step",
          }),
        },
        fields: [
          { type: "string" as const, name: "step", label: "Step Number" },
          { type: "string" as const, name: "name", label: "Name" },
          { type: "string" as const, name: "body", label: "Description" },
        ],
      },
    ],
  },
  // proof / team
  {
    type: "object" as const,
    name: "proof",
    label: "Proof / Team",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "intro", label: "Intro" },
      {
        type: "object" as const,
        name: "items",
        label: "Team Members",
        list: true,
        ui: {
          itemProps: (item: { name?: string }) => ({
            label: item?.name || "New Member",
          }),
        },
        fields: [
          { type: "string" as const, name: "name", label: "Name" },
          { type: "string" as const, name: "role", label: "Role" },
          { type: "string" as const, name: "body", label: "Bio" },
        ],
      },
    ],
  },
  // pricing
  {
    type: "object" as const,
    name: "pricing",
    label: "Pricing",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "intro", label: "Intro" },
      {
        type: "object" as const,
        name: "tiers",
        label: "Tiers",
        list: true,
        ui: {
          itemProps: (item: { name?: string }) => ({
            label: item?.name || "New Tier",
          }),
        },
        fields: [
          { type: "string" as const, name: "name", label: "Name" },
          { type: "string" as const, name: "from", label: "From Price" },
          { type: "string" as const, name: "body", label: "Description" },
          {
            type: "string" as const,
            name: "features",
            label: "Features",
            list: true,
          },
        ],
      },
      { type: "string" as const, name: "footnote", label: "Footnote" },
    ],
  },
  // contact
  {
    type: "object" as const,
    name: "contact",
    label: "Contact",
    fields: [
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "body", label: "Body" },
      {
        type: "object" as const,
        name: "form",
        label: "Form Labels",
        fields: [
          { type: "string" as const, name: "name", label: "Name Label" },
          { type: "string" as const, name: "email", label: "Email Label" },
          { type: "string" as const, name: "message", label: "Message Label" },
          { type: "string" as const, name: "send", label: "Send Button" },
          { type: "string" as const, name: "sending", label: "Sending Text" },
          { type: "string" as const, name: "success", label: "Success Message" },
          { type: "string" as const, name: "error", label: "Error Message" },
        ],
      },
      { type: "string" as const, name: "or", label: "Or Text" },
      { type: "string" as const, name: "email", label: "Email" },
    ],
  },
  // chat widget
  {
    type: "object" as const,
    name: "chat",
    label: "Chat Widget",
    fields: [
      { type: "string" as const, name: "launcher", label: "Launcher Text" },
      { type: "string" as const, name: "hint", label: "Hint Text" },
      { type: "string" as const, name: "title", label: "Title" },
      { type: "string" as const, name: "intro", label: "Intro" },
      { type: "string" as const, name: "placeholder", label: "Placeholder" },
      { type: "string" as const, name: "send", label: "Send Button" },
      { type: "string" as const, name: "close", label: "Close Button" },
      { type: "string" as const, name: "disclaimer", label: "Disclaimer" },
      { type: "string" as const, name: "error", label: "Error Message" },
      { type: "string" as const, name: "rateLimited", label: "Rate Limited Message" },
    ],
  },
  // footer
  {
    type: "object" as const,
    name: "footer",
    label: "Footer",
    fields: [
      { type: "string" as const, name: "tagline", label: "Tagline" },
      { type: "string" as const, name: "email", label: "Email" },
      { type: "string" as const, name: "kvk", label: "KVK" },
      { type: "string" as const, name: "location", label: "Location" },
      { type: "string" as const, name: "rights", label: "Rights" },
      {
        type: "object" as const,
        name: "legal",
        label: "Legal Links",
        fields: [
          { type: "string" as const, name: "label", label: "Label" },
          { type: "string" as const, name: "privacy", label: "Privacy" },
          { type: "string" as const, name: "terms", label: "Terms" },
          { type: "string" as const, name: "cookies", label: "Cookies" },
        ],
      },
    ],
  },
  // navigation
  {
    type: "object" as const,
    name: "nav",
    label: "Navigation",
    fields: [
      { type: "string" as const, name: "services", label: "Services" },
      { type: "string" as const, name: "work", label: "Work" },
      { type: "string" as const, name: "process", label: "Process" },
      { type: "string" as const, name: "pricing", label: "Pricing" },
      { type: "string" as const, name: "contact", label: "Contact" },
    ],
  },
];

// One collection per locale. Each targets messages/{locale}.json and only
// touches the keys it models — other keys (meta, error, legal, the
// unedited locales) are left untouched on save.
const locales = ["en", "nl", "ro", "ru"] as const;
const localeLabel: Record<string, string> = {
  en: "English",
  nl: "Dutch",
  ro: "Romanian",
  ru: "Russian",
};

export default defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: locales.map(
      (locale): Collection => ({
        name: `content_${locale}`,
        label: `Content (${localeLabel[locale]})`,
        path: "messages",
        match: {
          include: locale,
        },
        format: "json",
        fields: sectionFields(),
      })
    ),
  },
});
