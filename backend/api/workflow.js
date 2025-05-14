// backend/api/workflow.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database.sqlite');

// GET /api/workflow/:id_prodotto — recupera stato workflow per un prodotto
router.get('/:id_prodotto', (req, res) => {
  const { id_prodotto } = req.params;

  db.get('SELECT * FROM workflow_prodotti WHERE id_prodotto = ?', [id_prodotto], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Workflow non trovato' });
    res.json(row);
  });
});

// POST /api/workflow/:id_prodotto — aggiorna il flag del reparto loggato
router.post('/:id_prodotto', (req, res) => {
  const { id_prodotto } = req.params;
  const ruolo = req.session.user?.ruolo;
  const note = req.body.note || null;

  const permessi = {
    grafica: 'grafica_ok',
    distinte: 'distinte_ok',
    ricette: 'ricette_ok',
    contabilita: 'contabilita_ok',
    admin: 'validato_finale'
  };

  if (!permessi[ruolo]) return res.status(403).json({ error: 'Ruolo non autorizzato ad aggiornare workflow' });

  const campo = permessi[ruolo];

  const query = `UPDATE workflow_prodotti SET ${campo} = 1, note = ? WHERE id_prodotto = ?`;
  db.run(query, [note, id_prodotto], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Nessun workflow aggiornato' });
    res.json({ ok: true, campo, id_prodotto });
  });
});

module.exports = router;
