// frontend/scripts/utenti.js
let utenti = [];

// Verifica se admin
fetch('/api/utente')
  .then(res => res.json())
  .then(user => {
    if (user.ruolo !== 'admin') {
      document.body.innerHTML = '<p style="text-align:center">Accesso negato. Solo l’amministratore può gestire gli utenti.</p>';
      return;
    }
    caricaUtenti();
    document.getElementById('formUtente').addEventListener('submit', salvaUtente);
  })
  .catch(() => {
    document.body.innerHTML = '<p style="text-align:center">Sessione non valida.</p>';
  });

function caricaUtenti() {
  fetch('/api/utenti')
    .then(res => res.json())
    .then(data => {
      utenti = data;
      const tbody = document.querySelector('#tabellaUtenti tbody');
      tbody.innerHTML = '';
      utenti.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.ruolo}</td>
          <td>
            <button onclick="compilaForm('${u.username}')">Modifica</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function compilaForm(username) {
  const u = utenti.find(x => x.username === username);
  if (!u) return;
  document.getElementById('username').value = u.username;
  document.getElementById('email').value = u.email;
  document.getElementById('ruolo').value = u.ruolo;
  document.getElementById('password').value = '';
}

function salvaUtente(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const ruolo = document.getElementById('ruolo').value;

  if (!username || !email || !ruolo) return alert('Compila tutti i campi obbligatori.');

  fetch('/api/utenti', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, ruolo })
  })
    .then(res => res.json())
    .then(() => {
      caricaUtenti();
      document.getElementById('formUtente').reset();
    })
    .catch(err => console.error('Errore salvataggio:', err));
}
