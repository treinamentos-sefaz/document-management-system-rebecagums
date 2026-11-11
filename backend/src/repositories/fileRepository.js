const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDir } = require('../config');

function getPath(storageName) {
  if (!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(storageName || '')) {
    throw new Error('Nome de armazenamento inválido.');
  }

  return path.join(storageDir, storageName);
}

async function exists(storageName) {
  try {
    await fs.access(getPath(storageName));
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function remove(storageName) {
  try {
    await fs.unlink(getPath(storageName));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  getPath,
  exists,
  remove,
};