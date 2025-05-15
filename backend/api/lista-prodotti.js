const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.sqlite');
const db = new sqlite3.Database(dbPath);

// GET /api/prodotti
router.get('/', (req, res) => {
  const query = `
    SELECT
      p.id,
      p.codice_cliente,
      p.data_creazione,
      l.codice AS codice_linea,
      s.codice AS codice_stabilimento,
      c.codice AS codice_contenitore,
      f.codice AS codice_formato,
      t.codice AS codice_tipologia,
      cf.codice AS codice_confezione
    FROM prodotti p
    LEFT JOIN linee l ON p.id_linea = l.id
    LEFT JOIN stabilimenti s ON p.id_stabilimento = s.id
    LEFT JOIN contenitori c ON p.id_contenitore = c.id
    LEFT JOIN formati f ON p.id_formato = f.id
    LEFT JOIN tipologie t ON p.id_tipologia = t.id
    LEFT JOIN confezioni cf ON p.id_confezione = cf.id
    ORDER BY p.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const risultati = rows.map(r => {
      const base = [
        r.codice_linea,
        r.codice_stabilimento,
        r.codice_contenitore,
        r.codice_formato,
        r.codice_tipologia,
        r.codice_confezione
      ].filter(Boolean).join('');

      return {
        id: r.id,
        codice_prodotto: r.codice_cliente ? `${base}-${r.codice_cliente}` : base,
        codice_cliente: r.codice_cliente,
        data_creazione: r.data_creazione
      };
    });

    res.json(risultati);
  });
});

module.exports = router;
