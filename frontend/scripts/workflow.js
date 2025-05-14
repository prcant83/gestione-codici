// frontend/scripts/workflow.js
let ruoloUtente = null;
let prodottiGlobali = [];
let workflowGlobali = {};

fetch('/api/utente')
  .then(res => res.json())
  .then(user => {
    ruoloUtente = user.ruolo;
    caricaDati();
  })
  .catch(err => {
    document.getElementById('elencoWorkflow').innerHTML = '<p>Errore: utente non autenticato</p>';
    console.error(err);
  });

function caricaDati() {
  fetch('/api/prodotti')
    .then(res => res.json())
    .then(prodotti => {
      prodottiGlobali = prodotti;
      const richieste = prodotti.map(p => fetch(`/api/workflow/${p.id}`).then(res => res.json()));
      Promise.all(richieste).then(workflows => {
        prodotti.forEach((p, i) => {
          workflowGlobali[p.id] = workflows[i];
        });
        renderizzaWorkflow();
        setupFiltro();
      });
    });
}

function setupFiltro() {
  document.getElementById('filtroCodice').addEventListener('input', renderizzaWorkflow);
  document.getElementById('soloNonCompletati').addEventListener('change', renderizzaWorkflow);
}

function renderizzaWorkflow() {
  const container = document.getElementById('elencoWorkflow');
  container.innerHTML = '';

  const filtroTesto = document.getElementById('filtroCodice').value.toLowerCase();
  const soloNonValidati = document.getElementById('soloNonCompletati').checked;

  const prodottiFiltrati = prodottiGlobali.filter(p => {
    const workflow = workflowGlobali[p.id];
    if (!workflow) return false;
    const testoMatch = p.codice_prodotto.toLowerCase().includes(filtroTesto);
    const validatoMatch = soloNonValidati ? workflow.validato_finale === 0 : true;
    return testoMatch && validatoMatch;
  });

  prodottiFiltrati.forEach(prodotto => {
    const wrapper = document.createElement('div');
    wrapper.className = 'workflow-box';

    const titolo = document.createElement('h3');
    titolo.textContent = prodotto.codice_prodotto;
    wrapper.appendChild(titolo);

    const workflow = workflowGlobali[prodotto.id];
    const reparti = [
      { campo: 'grafica_ok', label: 'Grafica', ruolo: 'grafica' },
      { campo: 'distinte_ok', label: 'Distinte', ruolo: 'distinte' },
      { campo: 'ricette_ok', label: 'Ricette', ruolo: 'ricette' },
      { campo: 'contabilita_ok', label: 'Contabilità', ruolo: 'contabilita' },
      { campo: 'validato_finale', label: 'Validazione', ruolo: 'admin' }
    ];

    reparti.forEach(rep => {
      const riga = document.createElement('div');
      riga.className = 'workflow-row';

      const label = document.createElement('label');
      label.textContent = rep.label;

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = !!workflow[rep.campo];
      check.disabled = !(ruoloUtente === rep.ruolo || ruoloUtente === 'admin');
      check.addEventListener('change', () => aggiornaWorkflow(prodotto.id, rep.ruolo));

      riga.appendChild(label);
      riga.appendChild(check);
      wrapper.appendChild(riga);
    });

    container.appendChild(wrapper);
  });
}

function aggiornaWorkflow(idProdotto, ruolo) {
  fetch(`/api/workflow/${idProdotto}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: `Confermato da ${ruolo}` })
  })
    .then(res => res.json())
    .then(() => caricaDati())
    .catch(err => console.error('Errore aggiornamento:', err));
}
