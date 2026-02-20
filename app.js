require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const sequelize = require('./config/database');

// Importar modelos para que Sequelize los registre
require('./models/User');
require('./models/Store');
require('./models/Product');
require('./models/Alert');

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const alertRoutes = require('./routes/alerts');

const app = express();

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());

// Variables globales para todas las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
  };
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/alerts', alertRoutes);
app.use('/', productRoutes);

// Iniciar scheduler
require('./scheduler');

// Conectar DB y levantar servidor
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(PORT, () => {
      console.log(`🚀 BetterPrice corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a la DB:', err.message);
  });
