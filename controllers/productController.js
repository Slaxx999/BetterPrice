const { Op } = require('sequelize');
const Product = require('../models/Product');
const Store = require('../models/Store');
const scrapeAll = require('../scrapers/index');

const productController = {
  async home(req, res) {
    const products = await Product.findAll({
      include: Store,
      order: [['updatedAt', 'DESC']],
      limit: 40,
    });
    const grouped = groupByProduct(products);
    res.render('products/home', { title: 'BetterPrice', query: '', grouped });
  },

  async search(req, res) {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.redirect('/');
    }

    // Buscar en base de datos primero
    let products = await Product.findAll({
      where: { name: { [Op.like]: `%${q}%` } },
      include: Store,
    });

    // Si no hay resultados en DB, hacer scraping en tiempo real
    if (products.length === 0) {
      try {
        await scrapeAll(q);
        products = await Product.findAll({
          where: { name: { [Op.like]: `%${q}%` } },
          include: Store,
        });
      } catch (err) {
        console.error('Error scraping:', err.message);
      }
    }

    // Agrupar por nombre similar para comparar
    const grouped = groupByProduct(products);

    res.render('products/search', {
      title: `Resultados para "${q}"`,
      query: q,
      grouped,
    });
  },

  async show(req, res) {
    const product = await Product.findByPk(req.params.id, { include: Store });
    if (!product) return res.redirect('/');
    res.render('products/show', { title: product.name, product });
  },
};

function groupByProduct(products) {
  const groups = {};
  products.forEach((p) => {
    const key = p.name.toLowerCase().trim().substring(0, 30);
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.values(groups);
}

module.exports = productController;
