const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const { login } = require('./auth/auth');
const opzioniRouter = require('./api/opzioni');
const nuovoProdottoRouter = require('./api/nuovo-prodotto');
const listaProdottiRouter = require('./api/lista-prodotti');
const utenteRouter = require('./api/utente');
const workflowRouter = require('./api/workflow');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'supersegreto123';

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

// Middleware autenticazione sessione (per accesso classico a dashboard.html)
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login.html');
  next();
}

// Middleware autenticazione token per API
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token mancante' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token non valido' });

    req.user = user;
    next();
  });
}

// Rotte frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Autenticazione sessione classica (per compatibilità)
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

// Logout sessione
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// ✅ Autenticazione via API con token JWT
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Usa la funzione login definita in auth.js
  login({ body: { username, password } }, res);
});

// ✅ Rotte API protette da token
app.use('/api/utente', verifyToken, utenteRouter);
app.use('/api/opzioni', verifyToken, opzioniRouter);
app.use('/api/nuovo-prodotto', verifyToken, nuovoProdottoRouter);
app.use('/api/prodotti', verifyToken, listaProdottiRouter);
app.use('/api/workflow', verifyToken, workflowRouter);

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
