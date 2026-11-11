const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const { maxFileSizeBytes, storageDir } = require('../config');

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(storageDir, { recursive: true }, (error) => {
      callback(error, storageDir);
    });
  },
  filename(req, file, callback) {
    callback(null, randomUUID());
  },
});

module.exports = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },
});