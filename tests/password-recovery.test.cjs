const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function client(fetch) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(require.resolve('../app/helpers/authentication/passwordRecovery.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, fetch, process: { env: { NEXT_PUBLIC_AUTH_API: 'https://auth.example.test/api/auth/' } } });
  return exports;
}
const token = 'A'.repeat(64);

test('username and email use authenticator verification with leading-zero code preserved', async () => {
  for (const login of [' person ', ' person@example.test ']) {
    let call;
    const api = client(async (url, init) => { call = { url, init }; return Response.json({ resetToken: token, expiresIn: 300 }); });
    const result = await api.verifyPasswordRecovery(login, '012345');
    assert.equal(result.resetToken, token);
    assert.ok(call.url.endsWith('/password-recovery/verify'));
    assert.deepEqual(JSON.parse(call.init.body), { login: login.trim(), code: '012345' });
    assert.equal(call.init.cache, 'no-store');
  }
});

test('completion submits only reset authorization and matching password fields', async () => {
  let call;
  const api = client(async (url, init) => { call = { url, init }; return Response.json({ success: true }); });
  await api.completePasswordRecovery(token, 'New-Password-123!', 'New-Password-123!');
  assert.ok(call.url.endsWith('/password-recovery/complete'));
  assert.deepEqual(JSON.parse(call.init.body), { resetToken: token, password: 'New-Password-123!', confirmPassword: 'New-Password-123!' });
});

test('HTTP and legacy-wrapped failures never advance recovery', async () => {
  for (const status of [200, 400, 429, 500]) {
    const api = client(async () => Response.json({ success: false, code: 'recovery_rate_limited' }, { status }));
    await assert.rejects(() => api.verifyPasswordRecovery('person', '012345'), error => error.code === 'recovery_rate_limited');
    await assert.rejects(() => api.completePasswordRecovery(token, 'New-Password-123!', 'New-Password-123!'));
  }
});

test('malformed authorizations and completion responses are rejected', async () => {
  for (const body of [{}, { resetToken: 'old-email-code', expiresIn: 300 }, { resetToken: token, expiresIn: 3600 }, { resetToken: token, expiresIn: -1 }]) {
    const api = client(async () => Response.json(body));
    await assert.rejects(() => api.verifyPasswordRecovery('person', '012345'));
  }
  const api = client(async () => Response.json({ message: 'unexpected response' }));
  await assert.rejects(() => api.completePasswordRecovery(token, 'New-Password-123!', 'New-Password-123!'));
});
