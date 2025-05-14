// frontend/scripts/nuovo-prodotto.js
document.addEventListener('DOMContentLoaded', () => {
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
});

function aggiungiOpzione(campo) {
  const codice = prompt(`Inserisci il CODICE per ${campo} (es. VOL)`);
  if (!codice || !/^[A-Z0-9]{1,10}$/.test(codice)) {
    alert("Codice non valido. Usa solo lettere maiuscole o numeri, max 10 caratteri.");
    return;
  }

  const descrizione = prompt(`Inserisci la DESCRIZIONE per ${campo}`);
  if (!descrizione) return;

  // Check ruolo admin (frontend placeholder, da sostituire con check reale lato server/sessione)
  const isAdmin = true; // Placeholder, va gestito dal backend con sessione
  if (!isAdmin) {
    alert("Solo l'amministratore può aggiungere nuove voci.");
    return;
  }

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
