const { chromium } = require('playwright');
const Product = require('../models/Product');
const Store = require('../models/Store');

async function scrapeJumbo(query) {
  const [store] = await Store.findOrCreate({
    where: { name: 'Jumbo' },
    defaults: { url: 'https://www.jumbo.com.do', logo: '/img/jumbo.png' },
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`https://www.jumbo.com.do/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForSelector('.product-summary-2', { timeout: 10000 }).catch(() => {});

    const products = await page.$$eval('.product-summary-2', (cards) =>
      cards.slice(0, 10).map((card) => ({
        name: card.querySelector('.product-summary-name')?.innerText?.trim() || '',
        price: card.querySelector('.product-selling-price')?.innerText?.trim() || '',
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

module.exports = scrapeJumbo;
