
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database/database.sqlite');
const schemaPath = path.join(__dirname, 'crea_tabelle_prodotti.sql');

// Crea directory se non esiste
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Leggi lo script SQL
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Crea DB e esegui schema
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error('Errore apertura DB:', err.message);
  }
  console.log('✅ Database creato in', dbPath);
});

db.exec(schema, (err) => {
  if (err) {
    return console.error('Errore esecuzione script SQL:', err.message);
  }
  console.log('✅ Tabelle create con successo.');
  db.close();
});
