const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const exportsObject = {};
const source = ts.transpileModule(readFileSync(require.resolve('../app/helpers/apiResponse.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
vm.runInNewContext(source, { exports: exportsObject });
const { handleApiResponse } = exportsObject;

for (const [label, payload, httpStatus, expectedStatus, expected] of [
  ['API error', { error: 'Account already exists.' }, 409, 409, 'Account already exists.'],
  ['API message', { message: 'Resolve employee IDs 1, 2.' }, 409, 409, 'Resolve employee IDs 1, 2.'],
  ['problem details', { title: 'Invalid Excel file.' }, 400, 400, 'Invalid Excel file.'],
  ['legacy wrapped conflict', { success: false, status: 409, message: 'Duplicate employees.' }, 200, 409, 'Duplicate employees.'],
  ['legacy wrapped validation', { success: false, status: 400, message: 'No valid employee rows.' }, 200, 400, 'No valid employee rows.'],
]) {
  test(`upload displays ${label} with the original status`, async () => {
    await assert.rejects(() => handleApiResponse(Response.json(payload, { status: httpStatus }), 'Upload failed'),
      error => error.message === expected && error.status === expectedStatus);
  });
}

test('empty server failure retains generic fallback', async () => {
  await assert.rejects(() => handleApiResponse(new Response(null, { status: 500 }), 'Upload failed'),
    error => error.message === 'Upload failed' && error.status === 500);
});

test('a successful import with skipped-row errors is still a success', async () => {
  const result = { createdCount: 1, skippedCount: 1, errors: [{ rowNumber: 3, message: 'Invalid account' }] };
  assert.equal(JSON.stringify(await handleApiResponse(Response.json(result))), JSON.stringify(result));
});
