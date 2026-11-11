const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findById(id) {
  return documents.get(id) || null;
}

function findByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}

module.exports = {
  save,
  findById,
  findByOwner,
};