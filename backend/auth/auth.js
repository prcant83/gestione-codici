const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');

function login(username, password, callback) {
  const db = new sqlite3.Database(dbPath);

  db.get('SELECT * FROM utenti WHERE username = ?', [username], (err, user) => {
    if (err) return callback(err);
    if (!user) return callback(null, false);

    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) return callback(err);
      if (result) return callback(null, user);
      return callback(null, false);
    });
  });

  db.close();
}

module.exports = { login };
