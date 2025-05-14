const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite'); // corretto path

// Chiave segreta per firmare il JWT (da spostare in .env in futuro)
const JWT_SECRET = 'supersegreto123';

function login(req, res) {
  const { username, password } = req.body;

  const db = new sqlite3.Database(dbPath);

  db.get('SELECT * FROM utenti WHERE username = ? OR email = ?', [username, username], (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ success: false, message: 'Errore interno.' });
    }

    if (!user) {
      db.close();
      return res.status(401).json({ success: false, message: 'Utente non trovato.' });
    }

    bcrypt.compare(password, user.password_hash, (err, result) => {
      db.close();
      if (err) return res.status(500).json({ success: false, message: 'Errore nel confronto password.' });

      if (!result) return res.status(401).json({ success: false, message: 'Password errata.' });

      // Token JWT con i dati dell’utente
      const token = jwt.sign({
        id: user.id,
        username: user.username,
        ruolo: user.ruolo,
        reparti: user.reparti || ''
      }, JWT_SECRET, { expiresIn: '8h' });

      return res.json({
        success: true,
        token
      });
    });
  });
}

module.exports = { login };
