const cron = require('node-cron');
const Alert = require('./models/Alert');
const Product = require('./models/Product');
const Store = require('./models/Store');
const User = require('./models/User');
const { sendPriceAlert } = require('./config/mailer');
const scrapeAll = require('./scrapers/index');

// Corre cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Scheduler: verificando alertas de precio...');

  const alerts = await Alert.findAll({
    where: { active: true },
    include: [
      { model: Product, include: Store },
      { model: User },
    ],
  });

  for (const alert of alerts) {
    try {
      // Re-scrape para actualizar precio
      await scrapeAll(alert.Product.name);

      const updatedProduct = await Product.findByPk(alert.ProductId, { include: Store });

      if (parseFloat(updatedProduct.price) <= parseFloat(alert.targetPrice)) {
        await sendPriceAlert({
          to: alert.User.email,
          userName: alert.User.name,
          productName: updatedProduct.name,
          currentPrice: updatedProduct.price,
          targetPrice: alert.targetPrice,
          productUrl: updatedProduct.url,
          storeName: updatedProduct.Store.name,
        });

        await alert.update({ active: false });
        console.log(`✅ Alerta enviada a ${alert.User.email} para ${updatedProduct.name}`);
      }
    } catch (err) {
      console.error(`Error en alerta ${alert.id}:`, err.message);
    }
  }
});

console.log('📅 Scheduler iniciado — verificando cada 6 horas');
