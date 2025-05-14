// backend/setup-workflow.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database.sqlite');

(async () => {
  try {
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS workflow_prodotti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_prodotto INTEGER UNIQUE,
        grafica_ok INTEGER DEFAULT 0,
        distinte_ok INTEGER DEFAULT 0,
        ricette_ok INTEGER DEFAULT 0,
        contabilita_ok INTEGER DEFAULT 0,
        validato_finale INTEGER DEFAULT 0,
        note TEXT,
        FOREIGN KEY (id_prodotto) REFERENCES prodotti(id)
      )`, err => err ? reject(err) : resolve());
    });

    console.log('✅ Tabella workflow_prodotti creata correttamente.');
    db.close();
  } catch (err) {
    console.error('❌ Errore creazione workflow:', err);
    db.close();
  }
})();
