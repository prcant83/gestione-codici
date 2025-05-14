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
          option.textContent = opt.descrizione;
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
  const descrizione = prompt(`Inserisci nuova descrizione per ${campo}`);
  if (!descrizione) return;

  fetch(`/api/opzioni/${campo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descrizione })
  })
    .then(res => res.json())
    .then(nuova => {
      const select = document.getElementById(campo);
      const option = document.createElement('option');
      option.value = nuova.codice;
      option.textContent = nuova.descrizione;
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
