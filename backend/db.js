// backend/db.js
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { join } = require("path");
const { DB_FILE } = require("./config");

const adapter = new FileSync(join(process.cwd(), DB_FILE));
const db = low(adapter);

async function init() {
  // Set defaults (synchronous in lowdb v1)
  db.defaults({ events: [], contacts: [], users: [], kt_cache: [] }).write();
}

module.exports = { db, init };
