const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const { login } = require('./auth/auth');
const opzioniRouter = require('./api/opzioni');
const nuovoProdottoRouter = require('./api/nuovo-prodotto'); // <-- nuova rotta

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'gestione-codici-segreto', // cambia con una stringa più sicura
  resave: false,
  saveUninitialized: false
}));

// Serve file statici dal frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware per proteggere pagine riservate
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  next();
}

// Rotta principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Login POST
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  login(username, password, (err, user) => {
    if (err) {
      console.error('Errore login:', err);
      return res.status(500).send('Errore interno');
    }
    if (!user) {
      return res.status(401).send('Credenziali non valide');
    }

    req.session.user = user;
    res.redirect('/dashboard.html');
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Pagina protetta
app.get('/dashboard.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// ✅ API disponibili
app.use('/api/opzioni', opzioniRouter);
app.use('/api/nuovo-prodotto', nuovoProdottoRouter);

// API test
app.get('/api/test', (req, res) => {
  res.json({ messaggio: 'API funzionante!' });
});

// 404
app.use((req, res) => {
  res.status(404).send('Risorsa non trovata');
});

// Avvio
app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
