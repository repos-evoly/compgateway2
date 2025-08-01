/* ──────────── next.config.ts  COMPLETE ──────────── */

import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

/* locale routing, keep your existing i18n.ts */
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/* final Next.js config */
const nextConfig: NextConfig = {
  /* 🟢 your canvas alias (unchanged) */
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    };
    return config;
  },

  /* 🔐 built-in Sub-Resource Integrity (no extra plugin needed) */
  experimental: {
    sri: { algorithm: 'sha384' },
  },

  /* crossorigin="anonymous" on all <script>/<link> */
  crossOrigin: 'anonymous',

  trailingSlash: false,
};

/* wrap with next-intl and export */
export default withNextIntl(nextConfig);
