const path = require('node:path');
const { randomUUID } = require('node:crypto');

function sanitizeOriginalName(originalName) {
  const normalizedName = path.posix.basename(originalName.replace(/\\/g, '/'));
  const safeName = normalizedName.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return safeName || 'document';
}

function sanitizeContentType(contentType) {
  if (/^[\w!#$&^_.+-]+\/[\w!#$&^_.+-]+$/.test(contentType || '')) {
    return contentType;
  }
  return 'application/octet-stream';
}

function createDocumentMetadata(file, owner) {
  return {
    id: randomUUID(),
    originalName: sanitizeOriginalName(file.originalname),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    contentType: sanitizeContentType(file.mimetype),
    storageName: file.filename,
  };
}

module.exports = createDocumentMetadata;