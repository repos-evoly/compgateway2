const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, context) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(require.resolve(file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, URL, URLSearchParams, console, ...context });
  return exports;
}

test('company proxy no longer exposes policy control and preserves existing device routes', async () => {
  const calls = [];
  const route = load('../app/api/mobile-access/[...proxy]/route.ts', {
    process: { env: { MOBILE_BFF_BASE_URL: 'http://internal.test' } },
    require: name => {
      if (name === 'crypto') return { randomUUID: () => 'correlation' };
      if (name === 'next/server') return { NextResponse: { json: Response.json } };
      if (name === '@/app/api/_lib/authProxy') return {
        proxyUpstream: async (request, target, options) => {
          calls.push({ request, target, options });
          return { upstream: Response.json({}) };
        },
        nextResponseFrom: upstream => upstream,
      };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const request = method => ({ method, headers: new Headers(), nextUrl: new URL('http://web.test/?page=1&limit=20') });
  const denied = await route.GET(request('GET'), { params: Promise.resolve({ proxy: ['policy'] }) });
  assert.equal(denied.status, 404);
  assert.equal(route.PUT, undefined);
  await route.GET(request('GET'), { params: Promise.resolve({ proxy: ['devices'] }) });
  assert.equal(calls[0].target.pathname, '/api/admin/devices');
  assert.equal(calls[0].target.search, '?page=1&limit=20');
  assert.equal(calls.length, 1);
});
