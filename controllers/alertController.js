const Alert = require('../models/Alert');
const Product = require('../models/Product');
const Store = require('../models/Store');

const alertController = {
  async index(req, res) {
    const alerts = await Alert.findAll({
      where: { UserId: req.session.userId },
      include: [{ model: Product, include: Store }],
    });
    res.render('alerts/index', { title: 'Mis Alertas', alerts });
  },

  async create(req, res) {
    const { productId, targetPrice } = req.body;

    await Alert.create({
      ProductId: productId,
      UserId: req.session.userId,
      targetPrice,
    });

    req.flash('success', '¡Alerta creada! Te avisaremos cuando el precio baje.');
    res.redirect('/alerts');
  },

  async destroy(req, res) {
    await Alert.destroy({
      where: { id: req.params.id, UserId: req.session.userId },
    });
    req.flash('success', 'Alerta eliminada');
    res.redirect('/alerts');
  },
};

module.exports = alertController;
