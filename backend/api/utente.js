// backend/api/utente.js
const express = require('express');
const router = express.Router();

// ✅ GET /api/utente — restituisce l'utente autenticato dalla sessione
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Non autenticato' });
  }

  const { id, username, email, ruolo } = req.session.user;
  res.json({ id, username, email, ruolo });
});

module.exports = router;
