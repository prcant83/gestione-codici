const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Funzione per recuperare il codice da una tabella dato l'ID
function getCodiceFromTable(tabella, id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT codice FROM ${tabella} WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`ID non trovato in ${tabella}`));
      resolve(row.codice);
    });
  });
}

// POST /api/nuovo-prodotto
router.post('/', async (req, res) => {
  const {
    linea,
    stabilimento,
    contenitore,
    formato,
    tipologia,
    confezione,
    codice_cliente
  } = req.body;

  try {
    const codiceLinea = await getCodiceFromTable('linee', linea);
    const codiceStabilimento = await getCodiceFromTable('stabilimenti', stabilimento);
    const codiceContenitore = await getCodiceFromTable('contenitori', contenitore);
    const codiceFormato = await getCodiceFromTable('formati', formato);
    const codiceTipologia = await getCodiceFromTable('tipologie', tipologia);
    const codiceConfezione = await getCodiceFromTable('confezioni', confezione);

    let codiceProdotto = codiceLinea + codiceStabilimento + codiceContenitore + codiceFormato + codiceTipologia + codiceConfezione;
    if (codice_cliente && codice_cliente.trim() !== '') {
      codiceProdotto += '-' + codice_cliente.trim();
    }

    const query = `
      INSERT INTO prodotti (
        id_linea, id_stabilimento, id_contenitore, id_formato,
        id_tipologia, id_confezione, codice_cliente
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [linea, stabilimento, contenitore, formato, tipologia, confezione, codice_cliente || null], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, codice_prodotto: codiceProdotto });
    });
  } catch (error) {
    console.error('Errore creazione prodotto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
