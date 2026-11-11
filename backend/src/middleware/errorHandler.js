const multer = require('multer');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? 'FILE_TOO_LARGE' : 'INVALID_FILE',
        message: tooLarge
          ? 'O arquivo excede o limite permitido.'
          : 'Envie somente um arquivo no campo file.',
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Não foi possível concluir a operação.',
    },
  });
}

module.exports = errorHandler;