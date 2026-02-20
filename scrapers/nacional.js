const { chromium } = require('playwright');
const Product = require('../models/Product');
const Store = require('../models/Store');

async function scrapeNacional(query) {
  const [store] = await Store.findOrCreate({
    where: { name: 'Nacional' },
    defaults: { url: 'https://www.supermercadonacional.com', logo: '/img/nacional.png' },
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(
      `https://www.supermercadonacional.com/catalogsearch/result/?q=${encodeURIComponent(query)}`,
      { waitUntil: 'networkidle', timeout: 30000 }
    );

    await page.waitForSelector('.product-item', { timeout: 10000 }).catch(() => {});

    const products = await page.$$eval('.product-item', (cards) =>
      cards.slice(0, 10).map((card) => ({
        name: card.querySelector('.product-item-name')?.innerText?.trim() || '',
        price: card.querySelector('.price')?.innerText?.trim() || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || '',
      }))
    );

    for (const p of products) {
      const price = parseFloat(p.price.replace(/[^0-9.]/g, ''));
      if (!p.name || isNaN(price)) continue;

      await Product.findOrCreate({
        where: { name: p.name, StoreId: store.id },
        defaults: { price, image: p.image, url: p.url, StoreId: store.id },
      }).then(async ([product, created]) => {
        if (!created) await product.update({ price });
      });
    }
  } finally {
    await browser.close();
  }
}

module.exports = scrapeNacional;
