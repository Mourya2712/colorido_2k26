import Database from 'better-sqlite3';
const db = new Database('./data/colorido2k26.db');
console.log('--- TABLES ---');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(tables, null, 2));

console.log('--- REGISTRATIONS ---');
const regRows = db.prepare("SELECT * FROM registrations").all();
console.log(JSON.stringify(regRows, null, 2));
