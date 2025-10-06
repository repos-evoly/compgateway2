
//To build for uat server at 10.3.3.11 
// import createNextIntlPlugin from 'next-intl/plugin';

// const withNextIntl = createNextIntlPlugin('./i18n.ts');

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // ⬇️ add this function
//   webpack(config) {
//     // Stub out the optional Node-only dependency that pdfjs-dist tries to require
//     config.resolve = config.resolve || {};
//     config.resolve.alias = {
//       ...(config.resolve.alias || {}),
//       canvas: false,        // ← tells Webpack “pretend the ‘canvas’ module is empty”
//     };
//     return config;
//   },
// };

// export default withNextIntl(nextConfig);





// to build for the live server at https://companygw.com/Companygw
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve the app under /Companygw (affects routes and /public assets)
  basePath: '/Companygw',
  assetPrefix: '/Companygw',

  // Put the production build in a folder named "Companygw" (instead of .next)
  // This lets you copy that folder to the server as your build output.
  distDir: 'Companygw',

  // Optional niceties
  reactStrictMode: true,
  experimental: {
    sri: { algorithm: 'sha384' },
  },
  crossOrigin: 'anonymous',
  trailingSlash: false,

  // Webpack tweaks
  webpack(config) {
    // Stub the optional Node-only dependency that pdfjs-dist tries to require
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false, // pretend the 'canvas' module is empty
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
