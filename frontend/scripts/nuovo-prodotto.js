// frontend/scripts/nuovo-prodotto.js
let isAdmin = false;

// Al caricamento iniziale
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/utente')
    .then(res => res.json())
    .then(user => {
      isAdmin = user.ruolo === 'admin';
      if (!isAdmin) {
        document.querySelectorAll('.field-with-button button').forEach(btn => btn.style.display = 'none');
      }
    })
    .catch(err => {
      console.warn('Utente non autenticato o errore fetch /api/utente:', err);
      document.querySelectorAll('.field-with-button button').forEach(btn => btn.style.display = 'none');
    });

  const campi = [
    'linea', 'stabilimento', 'contenitore', 'formato',
    'tipologia', 'categoria', 'tipo_contenitore'
  ];

  // Carica opzioni da backend
  campi.forEach(campo => {
    fetch(`/api/opzioni/${campo}`)
      .then(res => res.json())
      .then(dati => {
        const select = document.getElementById(campo);
        dati.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.codice;
          option.textContent = `${opt.codice} - ${opt.descrizione}`;
          select.appendChild(option);
        });
        aggiornaCodice();
      })
      .catch(err => console.error(`Errore nel caricamento di ${campo}:`, err));
  });

  // Aggiorna codice in tempo reale
  document.querySelectorAll('select, input').forEach(el => {
    el.addEventListener('input', aggiornaCodice);
  });

  // Intercetta submit
  const form = document.getElementById('prodottoForm');
  if (form) {
    form.addEventListener('submit', e => {
      const codiceGenerato = document.getElementById('codiceGenerato').textContent;
      if (!codiceGenerato || codiceGenerato === '-') {
        e.preventDefault();
        alert('Codice non valido. Compila tutti i campi.');
      }
    });
  }
});

function aggiungiOpzione(campo) {
  if (!isAdmin) {
    alert("Solo l'amministratore può aggiungere nuove voci.");
    return;
  }

  const codice = prompt(`Inserisci il CODICE per ${campo} (es. VOL)`);
  if (!codice || !/^[A-Z0-9]{1,10}$/.test(codice)) {
    alert("Codice non valido. Usa solo lettere maiuscole o numeri, max 10 caratteri.");
    return;
  }

  const descrizione = prompt(`Inserisci la DESCRIZIONE per ${campo}`);
  if (!descrizione) return;

  fetch(`/api/opzioni/${campo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codice, descrizione })
  })
    .then(res => res.json())
    .then(nuova => {
      const select = document.getElementById(campo);
      const option = document.createElement('option');
      option.value = nuova.codice;
      option.textContent = `${nuova.codice} - ${nuova.descrizione}`;
      select.appendChild(option);
      select.value = nuova.codice;
      aggiornaCodice();
    })
    .catch(err => console.error('Errore inserimento:', err));
}

function aggiornaCodice() {
  const linea = getVal('linea');
  const stabilimento = getVal('stabilimento');
  const contenitore = getVal('contenitore');
  const formato = getVal('formato');
  const tipologia = getVal('tipologia');
  const categoria = getVal('categoria');
  const tipoContenitore = getVal('tipo_contenitore');
  const cliente = document.getElementById('codice_cliente').value.trim();

  if (cliente && !/^[0-9]+$/.test(cliente)) {
    document.getElementById('codiceGenerato').textContent = 'Codice cliente non valido';
    return;
  }

  if (linea && stabilimento && contenitore && formato && tipologia && categoria && tipoContenitore) {
    let codice = `${linea}${stabilimento}${contenitore}${formato}${tipologia}${categoria}${tipoContenitore}`;
    if (cliente) codice += `-${cliente}`;
    document.getElementById('codiceGenerato').textContent = codice;
  } else {
    document.getElementById('codiceGenerato').textContent = '-';
  }
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
