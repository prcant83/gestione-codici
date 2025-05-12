const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Dati utenti iniziali
const utenti = [
  { username: 'admin', email: 'admin@azienda.it', password: 'admin123', ruolo: 'admin' },
  { username: 'andrea', email: 'andrea@azienda.it', password: 'andrea123', ruolo: 'iniziale' },
  { username: 'giuseppina', email: 'giuseppina@azienda.it', password: 'giusy123', ruolo: 'distinte' },
  { username: 'antonio', email: 'antonio@azienda.it', password: 'antonio123', ruolo: 'ricette' },
  { username: 'paolo', email: 'paolo@azienda.it', password: 'paolo123', ruolo: 'contabilita' },
  { username: 'daniela', email: 'daniela@azienda.it', password: 'daniela123', ruolo: 'admin' },
  { username: 'guest', email: 'ospite@azienda.it', password: 'guest123', ruolo: 'viewer' }
];

// Percorso corretto del database esistente
const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error('❌ Errore apertura database:', err.message);
  }
});

// Crea tabella e inserisce utenti
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS utenti`);
  db.run(`
    CREATE TABLE utenti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      ruolo TEXT NOT NULL
    )
  `, (err) => {
    if (err) return console.error('❌ Errore creazione tabella:', err.message);

    const stmt = db.prepare(`INSERT INTO utenti (username, email, password_hash, ruolo) VALUES (?, ?, ?, ?)`);

    let inseriti = 0;

    utenti.forEach((utente, index) => {
      bcrypt.hash(utente.password, 10, (err, hash) => {
        if (err) return console.error('❌ Errore hash:', err.message);
        stmt.run(utente.username, utente.email, hash, utente.ruolo, (err) => {
          if (err) console.error(`⚠️ Errore inserimento ${utente.username}:`, err.message);
          inseriti++;
          if (inseriti === utenti.length) {
            stmt.finalize(() => {
              console.log('✅ Utenti creati con successo nel database.');
              db.close();
            });
          }
        });
      });
    });
  });
});
