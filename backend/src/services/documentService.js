const documentRepository = require('../repositories/documentRepository');
const fileRepository = require('../repositories/fileRepository');
const createDocumentMetadata = require('./documentMetadata');

async function createDocument(file, owner) {
  const document = createDocumentMetadata(file, owner);

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

  const filePath = await fileRepository.findExistingPath(document.storageName);
  if (!filePath) {
    return null;
  }

  return {
    document,
    filePath,
  };
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};