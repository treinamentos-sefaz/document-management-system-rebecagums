function requireUser(req, res, next) {
  const owner = req.get('X-User-Id')?.trim();

  if (!owner) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'O cabeçalho X-User-Id é obrigatório.',
      },
    });
  }

  req.owner = owner;
  return next();
}

module.exports = requireUser;