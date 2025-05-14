// backend/api/nuovo-prodotto.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Funzione per recuperare il codice tecnico da una tabella usando il codice (non ID numerico)
function getCodiceFromTable(tabella, codice) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT codice FROM ${tabella} WHERE codice = ?`, [codice], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`Codice non trovato nella tabella ${tabella}`));
      resolve(row.codice);
    });
  });
}

// POST /api/nuovo-prodotto — accessibile solo ad utenti autenticati (non viewer)
router.post('/', async (req, res) => {
  if (!req.session.user || req.session.user.ruolo === 'viewer') {
    return res.status(403).json({ error: 'Accesso negato. Utente non autorizzato.' });
  }

  const {
    linea,
    stabilimento,
    contenitore,
    formato,
    tipologia,
    categoria,
    tipo_contenitore,
    codice_cliente
  } = req.body;

  try {
    // Recupera codici tecnici
    const codiceLinea = await getCodiceFromTable('linee', linea);
    const codiceStabilimento = await getCodiceFromTable('stabilimenti', stabilimento);
    const codiceContenitore = await getCodiceFromTable('contenitori', contenitore);
    const codiceFormato = await getCodiceFromTable('formati', formato);
    const codiceTipologia = await getCodiceFromTable('tipologie', tipologia);
    const codiceCategoria = await getCodiceFromTable('categorie', categoria);
    const codiceTipoContenitore = await getCodiceFromTable('tipo_contenitore', tipo_contenitore);

    // Generazione codice prodotto
    let codiceProdotto = codiceLinea + codiceStabilimento + codiceContenitore +
                         codiceFormato + codiceTipologia + codiceCategoria + codiceTipoContenitore;

    if (codice_cliente && codice_cliente.trim() !== '') {
      codiceProdotto += '-' + codice_cliente.trim();
    }

    db.run(`CREATE TABLE IF NOT EXISTS prodotti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      linea TEXT, stabilimento TEXT, contenitore TEXT,
      formato TEXT, tipologia TEXT, categoria TEXT, tipo_contenitore TEXT,
      codice_cliente TEXT, codice_prodotto TEXT UNIQUE,
      data_creazione TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    const query = `INSERT INTO prodotti (
      linea, stabilimento, contenitore, formato,
      tipologia, categoria, tipo_contenitore,
      codice_cliente, codice_prodotto
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
      linea,
      stabilimento,
      contenitore,
      formato,
      tipologia,
      categoria,
      tipo_contenitore,
      codice_cliente || null,
      codiceProdotto
    ], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Codice prodotto già esistente.' });
        }
        return res.status(500).json({ error: err.message });
      }

      const idProdotto = this.lastID;

      db.run(`INSERT INTO workflow_prodotti (id_prodotto) VALUES (?)`, [idProdotto], function (err2) {
        if (err2) console.error('Errore creazione workflow associato:', err2.message);
      });

      res.json({
        id: idProdotto,
        codice_prodotto: codiceProdotto
      });
    });

  } catch (error) {
    console.error('Errore creazione prodotto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
