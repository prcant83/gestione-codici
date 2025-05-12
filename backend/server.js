const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // per leggere JSON nei body delle POST
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotte statiche
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API di test (puoi eliminarla)
app.get('/api/test', (req, res) => {
  res.json({ messaggio: 'API funzionante!' });
});

// 404 per tutto il resto
app.use((req, res) => {
  res.status(404).send('Risorsa non trovata');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
