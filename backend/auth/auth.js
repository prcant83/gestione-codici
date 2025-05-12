const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Apertura database
const dbPath = path.resolve(__dirname, '../database/utenti.sqlite');
const db = new sqlite3.Database(dbPath);

// Funzione di login
function login(username, password, callback) {
  const query = `SELECT * FROM utenti WHERE username = ? OR email = ?`;

  db.get(query, [username, username], (err, user) => {
    if (err) return callback(err);
    if (!user) return callback(null, false); // utente non trovato

    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err) return callback(err);
      if (!match) return callback(null, false); // password errata

      // login corretto
      callback(null, {
        id: user.id,
        username: user.username,
        ruolo: user.ruolo
      });
    });
  });
}

module.exports = { login };
