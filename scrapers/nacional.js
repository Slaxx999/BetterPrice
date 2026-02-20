const { chromium } = require('playwright');
const Product = require('../models/Product');
const Store = require('../models/Store');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeNacional(query) {
  const [store] = await Store.findOrCreate({
    where: { name: 'Nacional' },
    defaults: { url: 'https://supermercadosnacional.com', logo: '/img/nacional.png' },
  });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'es-DO',
    timezoneId: 'America/Santo_Domingo',
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.chrome = { runtime: {} };
  });

  try {
    await page.goto('https://supermercadosnacional.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);

    const input = await page.$('input[type="search"], input[placeholder*="Busca"]');
    if (!input) throw new Error('No se encontró input de búsqueda en Nacional');

    await input.click();
    await input.type(query, { delay: 80 });
    await page.keyboard.press('Enter');
    await sleep(6000);

    const products = await page.$$eval('.product-item', cards =>
      cards.slice(0, 15).map(card => ({
        name: card.querySelector('.product-item-link')?.innerText?.trim() || '',
        // Precio especial toma precedencia, si no usa precio normal
        price: (
          card.querySelector('.special-price .price')?.innerText?.trim() ||
          card.querySelector('.price')?.innerText?.trim() ||
          ''
        ),
        url: card.querySelector('a.product-item-link')?.href || '',
        image: card.querySelector('img')?.src || '',
      }))
    );

    for (const p of products) {
      const price = parseFloat(p.price.replace(/[^0-9.]/g, ''));
      if (!p.name || isNaN(price)) continue;

      const [product, created] = await Product.findOrCreate({
        where: { name: p.name, StoreId: store.id },
        defaults: { price, image: p.image, url: p.url, StoreId: store.id },
      });
      if (!created) await product.update({ price, image: p.image });
    }

    console.log(`✅ Nacional: ${products.length} productos para "${query}"`);
  } finally {
    await browser.close();
  }
}

module.exports = scrapeNacional;
