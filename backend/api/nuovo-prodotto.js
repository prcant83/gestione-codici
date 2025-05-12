document.addEventListener('DOMContentLoaded', () => {
  const campi = ['linea', 'stabilimento', 'contenitore', 'formato', 'tipologia', 'confezione'];

  // Carica opzioni da backend
  campi.forEach(campo => {
    fetch(`/api/opzioni/${campo}`)
      .then(res => res.json())
      .then(dati => {
        const select = document.getElementById(campo);
        dati.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.id;
          option.textContent = opt.descrizione;
          select.appendChild(option);
        });
      })
      .catch(err => console.error(`Errore nel caricamento di ${campo}:`, err));
  });
});

function aggiungiOpzione(campo) {
  const descrizione = prompt(`Inserisci la descrizione per il nuovo elemento di ${campo}`);
  if (!descrizione) return;

  const codice = prompt(`Inserisci il codice tecnico per "${descrizione}" (es. sigla breve)`);
  if (!codice) return;

  fetch(`/api/opzioni/${campo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descrizione, codice })
  })
    .then(res => res.json())
    .then(nuova => {
      const select = document.getElementById(campo);
      const option = document.createElement('option');
      option.value = nuova.id;
      option.textContent = nuova.descrizione;
      select.appendChild(option);
      select.value = nuova.id;
    })
    .catch(err => console.error('Errore inserimento:', err));
}
