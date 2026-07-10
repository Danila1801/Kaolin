import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Wires i18n/request.ts into the build so server components
// can call getTranslations() without extra setup.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
