const scrapeJumbo = require('./jumbo');
const scrapeNacional = require('./nacional');
const scrapeLaSirena = require('./lasirena');

async function scrapeAll(query) {
  const results = await Promise.allSettled([
    scrapeJumbo(query),
    scrapeNacional(query),
    scrapeLaSirena(query),
  ]);

  results.forEach((result, i) => {
    const names = ['Jumbo', 'Nacional', 'La Sirena'];
    if (result.status === 'rejected') {
      console.error(`Error en scraper ${names[i]}:`, result.reason.message);
    }
  });
}

module.exports = scrapeAll;
