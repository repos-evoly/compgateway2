const http = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');
const next = require('next');

const dir = __dirname;
process.env.NODE_ENV = 'production';
process.chdir(dir);

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOST || process.env.LISTEN_HOST || '0.0.0.0';

const configPath = path.join(dir, 'Companygw', 'required-server-files.json');
let nextConfig = {};
try {
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw);
  nextConfig = parsed?.config ?? {};
} catch (error) {
  console.error('Failed to load Next.js standalone config.', error);
  process.exit(1);
}

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

const app = next({ dir, dev: false, conf: nextConfig });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        const url = req.url || '/';
        if (url === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('ok');
          return;
        }

        handle(req, res, parse(url, true));
      })
      .listen(port, hostname, () => {
console.log('Next config basePath:', nextConfig.basePath);
console.log('Next config assetPrefix:', nextConfig.assetPrefix);
console.log(`Ready on http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error('Failed to start Next.js server.', error);
    process.exit(1);
  });
