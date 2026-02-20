const { chromium } = require('playwright');
const Product = require('../models/Product');
const Store = require('../models/Store');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeJumbo(query) {
  const [store] = await Store.findOrCreate({
    where: { name: 'Jumbo' },
    defaults: { url: 'https://jumbo.com.do', logo: '/img/jumbo.png' },
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
    await page.goto('https://jumbo.com.do', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    const input = await page.$('input[type="search"], input[name="q"], input[placeholder*="Busca"], input[placeholder*="busca"], #search');
    if (!input) throw new Error('No se encontró input de búsqueda en Jumbo');

    await input.click();
    await input.type(query, { delay: 80 });
    await page.keyboard.press('Enter');
    await sleep(8000);

    // Scroll para activar lazy loading
    await page.evaluate(() => window.scrollTo(0, 600));
    await sleep(2000);

    const products = await page.$$eval('.product-item-tile__details', cards =>
      cards.slice(0, 15).map(card => ({
        name: card.querySelector('.product-item-tile__link')?.innerText?.trim() || '',
        price: card.querySelector('[data-price-amount]')?.getAttribute('data-price-amount') || '',
        url: card.querySelector('.product-item-tile__link')?.href || '',
        image: card.closest('li')?.querySelector('img')?.src || '',
      }))
    );

    for (const p of products) {
      const price = parseFloat(p.price);
      if (!p.name || isNaN(price)) continue;

      const [product, created] = await Product.findOrCreate({
        where: { name: p.name, StoreId: store.id },
        defaults: { price, image: p.image, url: p.url, StoreId: store.id },
      });
      if (!created) await product.update({ price, image: p.image });
    }

    console.log(`✅ Jumbo: ${products.length} productos para "${query}"`);
  } finally {
    await browser.close();
  }
}

module.exports = scrapeJumbo;
