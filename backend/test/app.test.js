const { after, before, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDir;
process.env.MAX_FILE_SIZE_BYTES = '64';

const app = require('../src/app');
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.rmSync(storageDir, { recursive: true, force: true });
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download respeitam o dono do documento', async () => {
  const owner = 'usuario-teste';
  const form = new FormData();
  form.append('file', new Blob(['conteudo local'], { type: 'text/plain' }), 'relatorio.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': owner },
    body: form,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const { data: document } = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'relatorio.txt');
  assert.strictEqual(document.owner, owner);
  assert.strictEqual(document.size, Buffer.byteLength('conteudo local'));
  assert.ok(document.id);
  assert.ok(document.uploadedAt);
  assert.strictEqual(Object.hasOwn(document, 'storageName'), false);

  const ownListResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': owner },
  });
  assert.deepStrictEqual((await ownListResponse.json()).data, [document]);

  const otherListResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'outro-usuario' },
  });
  assert.deepStrictEqual((await otherListResponse.json()).data, []);

  const deniedDownload = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'outro-usuario' },
  });
  assert.strictEqual(deniedDownload.status, 404);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': owner },
  });
  assert.strictEqual(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /attachment/);
  assert.strictEqual(await downloadResponse.text(), 'conteudo local');
});

test('requisições sem usuário ou arquivo são rejeitadas', async () => {
  const missingUserForm = new FormData();
  missingUserForm.append('file', new Blob(['x']), 'file.txt');
  const missingUserResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: missingUserForm,
  });
  assert.strictEqual(missingUserResponse.status, 400);

  const missingFileResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-sem-arquivo' },
    body: new FormData(),
  });
  assert.strictEqual(missingFileResponse.status, 400);
});

test('upload acima do limite retorna 413', async () => {
  const form = new FormData();
  form.append('file', new Blob(['x'.repeat(65)]), 'grande.txt');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-limite' },
    body: form,
  });

  assert.strictEqual(response.status, 413);
  assert.strictEqual((await response.json()).error.code, 'FILE_TOO_LARGE');
});

test('download com identificador malformado retorna 400', async () => {
  const response = await fetch(`${baseUrl}/documents/invalido/download`, {
    headers: { 'X-User-Id': 'usuario-teste' },
  });

  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'VALIDATION_ERROR');
});
