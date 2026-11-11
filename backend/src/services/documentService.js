const path = require('node:path');
const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');
const fileRepository = require('../repositories/fileRepository');

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

async function createDocument(file, owner) {
  const document = {
    id: randomUUID(),
    originalName: sanitizeOriginalName(file.originalname),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    contentType: sanitizeContentType(file.mimetype),
    storageName: file.filename,
  };

  try {
    return documentRepository.save(document);
  } catch (error) {
    await fileRepository.remove(file.filename).catch(() => {});
    throw error;
  }
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner);
}

async function getDocumentForDownload(id, owner) {
  const document = documentRepository.findById(id);

  if (!document || document.owner !== owner) {
    return null;
  }

  if (!(await fileRepository.exists(document.storageName))) {
    return null;
  }

  return {
    document,
    filePath: fileRepository.getPath(document.storageName),
  };
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};