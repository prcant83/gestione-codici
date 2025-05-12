// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { loginUser } = require('./auth');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// API login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password obbligatori' });
  }

  loginUser(username, password, (err, user) => {
    if (err) return res.status(500).json({ message: 'Errore interno del server' });
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' });

    res.status(200).json({ ruolo: user.ruolo, username: user.username });
  });
});

// Pagina principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server Node.js avviato su http://localhost:${PORT}`);
});
