// frontend/scripts/workflow.js
let ruoloUtente = null;
let prodottiGlobali = [];
let workflowGlobali = {};
let paginaCorrente = 1;
const perPagina = 10;

fetch('/api/utente')
  .then(res => res.json())
  .then(user => {
    ruoloUtente = user.ruolo;
    document.getElementById('soloNonCompletati').checked = true;
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
  document.getElementById('filtroCodice').addEventListener('input', () => {
    paginaCorrente = 1;
    renderizzaWorkflow();
  });
  document.getElementById('soloNonCompletati').addEventListener('change', () => {
    paginaCorrente = 1;
    renderizzaWorkflow();
  });
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

  const totalePagine = Math.ceil(prodottiFiltrati.length / perPagina);
  const start = (paginaCorrente - 1) * perPagina;
  const visibili = prodottiFiltrati.slice(start, start + perPagina);

  // Conteggio
  const info = document.createElement('p');
  info.textContent = `Mostrati ${start + 1}–${Math.min(start + visibili.length, prodottiFiltrati.length)} di ${prodottiFiltrati.length}`;
  info.style.marginBottom = '1rem';
  container.appendChild(info);

  visibili.forEach(prodotto => {
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

  if (totalePagine > 1) {
    const paginazione = document.createElement('div');
    paginazione.style.textAlign = 'center';
    paginazione.style.marginTop = '2rem';

    if (paginaCorrente > 1) {
      const prev = document.createElement('button');
      prev.textContent = '← Pagina precedente';
      prev.onclick = () => { paginaCorrente--; renderizzaWorkflow(); };
      paginazione.appendChild(prev);
    }

    const span = document.createElement('span');
    span.textContent = ` Pagina ${paginaCorrente} di ${totalePagine} `;
    paginazione.appendChild(span);

    if (paginaCorrente < totalePagine) {
      const next = document.createElement('button');
      next.textContent = 'Pagina successiva →';
      next.onclick = () => { paginaCorrente++; renderizzaWorkflow(); };
      paginazione.appendChild(next);
    }

    container.appendChild(paginazione);
  }
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
