const documentService = require('../services/documentService');

function toPublicDocument({ storageName, ...document }) {
  return document;
}

async function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Envie um arquivo no campo file.',
      },
    });
  }

  const document = await documentService.createDocument(req.file, req.owner);
  return res.status(201).json({ data: toPublicDocument(document) });
}

function list(req, res) {
  const documents = documentService.listDocuments(req.owner);
  return res.json({ data: documents.map(toPublicDocument) });
}

async function download(req, res, next) {
  const documentId = req.params.id;
  if (!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(documentId)) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'O identificador do documento é inválido.',
      },
    });
  }

  const result = await documentService.getDocumentForDownload(documentId.toLowerCase(), req.owner);

  if (!result) {
    return res.status(404).json({
      error: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Documento não encontrado.',
      },
    });
  }

  return res.download(
    result.filePath,
    result.document.originalName,
    { headers: { 'Content-Type': result.document.contentType } },
    (error) => {
      if (!error) {
        return;
      }
      if (res.headersSent) {
        return res.destroy(error);
      }
      return next(error);
    },
  );
}

module.exports = {
  upload,
  list,
  download,
};