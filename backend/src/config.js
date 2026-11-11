const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');
const configuredLimit = Number.parseInt(process.env.MAX_FILE_SIZE_BYTES, 10);

module.exports = {
  storageDir: path.resolve(backendRoot, process.env.STORAGE_DIR || 'storage'),
  maxFileSizeBytes:
    Number.isSafeInteger(configuredLimit) && configuredLimit > 0
      ? configuredLimit
      : 10 * 1024 * 1024,
};