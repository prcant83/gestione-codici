// backend/api/opzioni.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Campi ammessi
const tabelleValide = [
  'linea', 'stabilimento', 'contenitore', 'formato',
  'tipologia', 'categoria', 'tipo_contenitore'
];

// Mappa logica campo → tabella DB
const tabellaMap = {
  linea: 'linee',
  stabilimento: 'stabilimenti',
  contenitore: 'contenitori',
  formato: 'formati',
  tipologia: 'tipologie',
  categoria: 'categorie',
  tipo_contenitore: 'tipo_contenitore'
};

// ✅ GET /api/opzioni/:campo — Ritorna elenco opzioni per un campo
router.get('/:campo', (req, res) => {
  const campo = req.params.campo;
  if (!tabelleValide.includes(campo)) return res.status(400).send('Campo non valido');

  const tabella = tabellaMap[campo];
  db.all(`SELECT codice, descrizione FROM ${tabella} ORDER BY descrizione ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ POST /api/opzioni/:campo — Inserisce nuova opzione con descrizione e codice
router.post('/:campo', (req, res) => {
  const campo = req.params.campo;
  const { descrizione, codice } = req.body;

  if (!tabelleValide.includes(campo)) return res.status(400).send('Campo non valido');
  if (!descrizione || !codice) return res.status(400).send('Descrizione e codice sono obbligatori');

  const tabella = tabellaMap[campo];
  const query = `INSERT INTO ${tabella} (codice, descrizione) VALUES (?, ?)`;

  db.run(query, [codice.trim(), descrizione.trim()], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ codice: codice.trim(), descrizione });
  });
});

module.exports = router;
