import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⬇️ add this function
  webpack(config) {
    // Stub out the optional Node-only dependency that pdfjs-dist tries to require
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,        // ← tells Webpack “pretend the ‘canvas’ module is empty”
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
