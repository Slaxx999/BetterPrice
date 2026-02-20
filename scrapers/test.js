require('dotenv').config();
require('../models/User');
require('../models/Store');
require('../models/Product');
require('../models/Alert');

const sequelize = require('../config/database');
const scrapeAll = require('./index');

async function main() {
  await sequelize.sync();
  console.log('🔍 Scrapeando "arroz" en todas las tiendas...\n');
  await scrapeAll('arroz');

  const Product = require('../models/Product');
  const Store = require('../models/Store');
  const products = await Product.findAll({ include: Store, limit: 15 });

  console.log('\n📦 Productos guardados en DB:');
  products.forEach(p => {
    console.log(`  [${p.Store.name}] ${p.name} → RD$${p.price}`);
  });

  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
