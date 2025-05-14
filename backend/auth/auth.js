// backend/auth/auth.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');

function login(username, password, callback) {
  const db = new sqlite3.Database(dbPath);

  db.get('SELECT * FROM utenti WHERE username = ?', [username], (err, user) => {
    if (err) {
      db.close();
      return callback(err);
    }
    if (!user) {
      db.close();
      return callback(null, false);
    }

    bcrypt.compare(password, user.password_hash, (err, result) => {
      db.close();
      if (err) return callback(err);
      if (result) {
        // Restituisce solo i dati necessari nella sessione
        const sessionUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          ruolo: user.ruolo
        };
        return callback(null, sessionUser);
      }
      return callback(null, false);
    });
  });
}

module.exports = { login };
