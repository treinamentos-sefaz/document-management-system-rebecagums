const express = require('express');
const documentController = require('../controllers/documentController');
const requireUser = require('../middleware/requireUser');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', requireUser, upload.single('file'), documentController.upload);
router.get('/documents', requireUser, documentController.list);
router.get('/documents/:id/download', requireUser, documentController.download);

module.exports = router;