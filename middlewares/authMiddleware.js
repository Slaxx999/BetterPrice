const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Debes iniciar sesión para continuar');
    return res.redirect('/auth/login');
  }
  next();
};

module.exports = authMiddleware;
