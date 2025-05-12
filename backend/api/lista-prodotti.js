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
      l.codice || s.codice || c.codice || f.codice || t.codice || cf.codice AS codice_prodotto
    FROM prodotti p
    JOIN linee l ON p.id_linea = l.id
    JOIN stabilimenti s ON p.id_stabilimento = s.id
    JOIN contenitori c ON p.id_contenitore = c.id
    JOIN formati f ON p.id_formato = f.id
    JOIN tipologie t ON p.id_tipologia = t.id
    JOIN confezioni cf ON p.id_confezione = cf.id
    ORDER BY p.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const risultati = rows.map(r => {
      return {
        id: r.id,
        codice_prodotto: r.codice_cliente ? `${r.codice_prodotto}-${r.codice_cliente}` : r.codice_prodotto,
        codice_cliente: r.codice_cliente,
        data_creazione: r.data_creazione
      };
    });

    res.json(risultati);
  });
});

module.exports = router;
