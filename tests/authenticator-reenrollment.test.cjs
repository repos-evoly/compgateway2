const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

const attempt = '1'.repeat(32);
const key = 'a'.repeat(64);
const config = { path: '/Companygw/api/auth', httpOnly: true, secure: true, sameSite: 'strict' };
const recovery = {
  recoveryProofCookie: 'authenticatorRecoveryProof',
  recoveryBrowserCookie: 'authenticatorRecoveryBrowser',
  recoveryBrowserHeader: 'X-Authenticator-Recovery-Browser',
  recoveryCookieConfig: config,
  isRecoveryBrowserKey: (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value),
};

function loadProxy(fetch) {
  const exports = {};
  const source = readFileSync(require.resolve('../app/api/auth/2fa-recovery/[action]/route.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInNewContext(compiled.outputText, { exports, fetch, AbortSignal, require: (name) => {
    if (name.endsWith('/_base')) return { AUTH_API_BASE: 'https://auth.example.test/api/auth/' };
    if (name.endsWith('/_authenticatorRecovery')) return recovery;
    return require(name);
  } });
  return exports.POST;
}

function call(post, action, body, site = 'same-origin') {
  const request = new NextRequest(`https://gateway.example.test/Companygw/api/auth/2fa-recovery/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 'Sec-Fetch-Site': site,
      Cookie: `authenticatorRecoveryProof=${attempt}.credential-proof; authenticatorRecoveryBrowser=${key}; authDeviceId=browser-1`,
    },
    body: JSON.stringify(body),
  });
  return post(request, { params: Promise.resolve({ action }) });
}

test('a different login attempt or a cross-site request cannot exercise the browser proof', async () => {
  const post = loadProxy(async () => assert.fail('unexpected upstream request'));
  assert.equal((await call(post, 'request', { attempt: '2'.repeat(32) })).status, 401);
  assert.equal((await call(post, 'request', { attempt }, 'cross-site')).status, 403);
});

test('the proxy uses the protected cookies and preserves the leading zero in the confirmation code', async () => {
  const post = loadProxy(async (url, init) => {
    assert.equal(url, 'https://auth.example.test/api/auth/2fa-recovery/complete');
    assert.equal(init.headers[recovery.recoveryBrowserHeader], key);
    assert.equal(init.headers.Cookie, 'authDeviceId=browser-1');
    assert.deepEqual(JSON.parse(init.body), { proof: 'credential-proof', code: '012345' });
    return Response.json({ status: 'completed' });
  });
  const response = await call(post, 'complete', { attempt, proof: 'ignored', code: '012345' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.cookies.get(recovery.recoveryProofCookie).maxAge, 0);
});
