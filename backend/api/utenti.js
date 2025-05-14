// backend/api/utenti.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./backend/database.sqlite');

// Solo per admin
router.use((req, res, next) => {
  if (!req.session.user || req.session.user.ruolo !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato. Solo admin.' });
  }
  next();
});

// GET /api/utenti - elenco utenti
router.get('/', (req, res) => {
  db.all('SELECT username, email, ruolo FROM utenti ORDER BY username ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/utenti - crea o aggiorna utente
router.post('/', (req, res) => {
  const { username, email, password, ruolo } = req.body;
  if (!username || !email || !ruolo) return res.status(400).json({ error: 'Campi obbligatori mancanti.' });

  const updateUser = () => {
    db.run('UPDATE utenti SET email = ?, ruolo = ? WHERE username = ?', [email, ruolo, username], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: true });
    });
  };

  db.get('SELECT * FROM utenti WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (user) {
      // Se viene fornita una nuova password, aggiorna anche quella
      if (password) {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) return res.status(500).json({ error: err.message });
          db.run('UPDATE utenti SET email = ?, ruolo = ?, password_hash = ? WHERE username = ?', [email, ruolo, hash, username], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: true });
          });
        });
      } else {
        updateUser();
      }
    } else {
      // Nuovo utente
      if (!password) return res.status(400).json({ error: 'Password obbligatoria per nuovo utente.' });
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run('INSERT INTO utenti (username, email, password_hash, ruolo) VALUES (?, ?, ?, ?)', [username, email, hash, ruolo], function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ created: true });
        });
      });
    }
  });
});

module.exports = router;
