// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const { login } = require('./auth/auth');
const opzioniRouter = require('./api/opzioni');
const nuovoProdottoRouter = require('./api/nuovo-prodotto');
const listaProdottiRouter = require('./api/lista-prodotti');
const utenteRouter = require('./api/utente');
const workflowRouter = require('./api/workflow');

const app = express();
const PORT = 3000;

// Middleware base
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'gestione-codici-segreto',
  resave: false,
  saveUninitialized: false
}));

// Static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware autenticazione
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login.html');
  next();
}

// Rotte frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Autenticazione
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  login(username, password, (err, user) => {
    if (err) {
      console.error('Errore login:', err);
      return res.status(500).send('Errore interno');
    }
    if (!user) return res.status(401).send('Credenziali non valide');

    req.session.user = user;
    res.redirect('/dashboard.html');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// Rotte API
app.use('/api/utente', utenteRouter);
app.use('/api/opzioni', opzioniRouter);
app.use('/api/nuovo-prodotto', nuovoProdottoRouter);
app.use('/api/prodotti', listaProdottiRouter);
app.use('/api/workflow', workflowRouter);

// Test API
app.get('/api/test', (req, res) => {
  res.json({ messaggio: 'API funzionante!' });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send('Risorsa non trovata');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
