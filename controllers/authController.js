const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const authController = {
  showRegister(req, res) {
    res.render('auth/register', { title: 'Registrarse', errors: [], data: {} });
  },

  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Registrarse',
        errors: errors.array(),
        data: req.body,
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Registrarse',
        errors: [{ msg: 'El email ya está en uso' }],
        data: req.body,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    req.flash('success', '¡Cuenta creada! Ahora puedes iniciar sesión.');
    res.redirect('/auth/login');
  },

  showLogin(req, res) {
    res.render('auth/login', { title: 'Iniciar Sesión', errors: [], data: {} });
  },

  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Iniciar Sesión',
        errors: errors.array(),
        data: req.body,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('auth/login', {
        title: 'Iniciar Sesión',
        errors: [{ msg: 'Email o contraseña incorrectos' }],
        data: req.body,
      });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    res.redirect('/');
  },

  logout(req, res) {
    req.session.destroy();
    res.redirect('/auth/login');
  },
};

module.exports = authController;
