const { chromium } = require('playwright');
const Product = require('../models/Product');
const Store = require('../models/Store');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeSirena(query) {
  const [store] = await Store.findOrCreate({
    where: { name: 'Sirena' },
    defaults: { url: 'https://sirena.do', logo: '/img/sirena.png' },
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
    await page.goto('https://sirena.do', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    const input = await page.$('input[placeholder*="busca"], input[placeholder*="Qué"]');
    if (!input) throw new Error('No se encontró input de búsqueda en Sirena');

    await input.click();
    await input.type(query, { delay: 80 });
    await page.keyboard.press('Enter');
    await sleep(6000);

    // Cerrar popup si aparece
    await page.click('button:has-text("CERRAR")').catch(() => {});
    await sleep(1000);

    const products = await page.$$eval('.item-product', cards =>
      cards.slice(0, 15).map(card => ({
        name: card.querySelector('.item-product-title a')?.innerText?.trim() || '',
        price: card.querySelector('.item-product-price strong')?.innerText?.trim() || '',
        url: 'https://sirena.do' + (card.querySelector('.item-product-title a')?.getAttribute('href') || ''),
        image: (() => {
          const el = card.querySelector('.item-product-image');
          if (!el) return '';
          const style = el.getAttribute('style') || '';
          const match = style.match(/url\("?([^")]+)"?\)/);
          return match ? match[1] : '';
        })(),
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

    console.log(`✅ Sirena: ${products.length} productos para "${query}"`);
  } finally {
    await browser.close();
  }
}

module.exports = scrapeSirena;
