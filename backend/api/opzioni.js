const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Campi validi
const tabelleValide = ['linea', 'stabilimento', 'contenitore', 'formato', 'tipologia', 'confezione'];

// Mappa campo -> tabella
const tabellaMap = {
  linea: 'linee',
  stabilimento: 'stabilimenti',
  contenitore: 'contenitori',
  formato: 'formati',
  tipologia: 'tipologie',
  confezione: 'confezioni'
};

// GET /api/opzioni/:campo
router.get('/:campo', (req, res) => {
  const campo = req.params.campo;
  if (!tabelleValide.includes(campo)) return res.status(400).send('Campo non valido');

  const tabella = tabellaMap[campo];
  db.all(`SELECT id, descrizione FROM ${tabella} ORDER BY descrizione ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/opzioni/:campo
router.post('/:campo', (req, res) => {
  const campo = req.params.campo;
  const { descrizione, codice } = req.body;

  if (!tabelleValide.includes(campo)) return res.status(400).send('Campo non valido');
  if (!descrizione || !codice) return res.status(400).send('Descrizione e codice sono obbligatori');

  const tabella = tabellaMap[campo];
  const query = `INSERT INTO ${tabella} (descrizione, codice) VALUES (?, ?)`;

  db.run(query, [descrizione, codice], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, descrizione });
  });
});

module.exports = router;
