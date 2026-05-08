const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'DATABASE', 'database.json');

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { offers: [], stats: { totalOffersCreated: 0, lastUpdated: new Date().toISOString() } };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(data) {
  data.stats = data.stats || {};
  data.stats.totalOffersCreated = Array.isArray(data.offers) ? data.offers.length : 0;
  data.stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { DB_PATH, readDb, writeDb, ensureDb };
