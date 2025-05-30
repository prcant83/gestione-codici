// frontend/scripts/workflow.js
let ruoloUtente = null;
let prodottiGlobali = [];
let workflowGlobali = {};
let paginaCorrente = 1;
let perPagina = 10;

fetch('/api/utente')
  .then(res => res.json())
  .then(user => {
    ruoloUtente = user.ruolo;
    document.getElementById('soloNonCompletati').checked = true;
    setupFiltro();
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
      const richieste = prodotti.map(p =>
        fetch(`/api/workflow/${p.id}`)
          .then(res => res.ok ? res.json() : null)
          .catch(err => {
            console.warn(`Errore fetch workflow per prodotto ${p.id}:`, err);
            return null;
          })
      );
      Promise.all(richieste).then(workflows => {
        prodotti.forEach((p, i) => {
          console.log(`Prodotto ID ${p.id} - ${p.codice_prodotto}:`, workflows[i]);
          workflowGlobali[p.id] = workflows[i];
        });
        renderizzaWorkflow();
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
  const perPageSelect = document.createElement('select');
  [10, 20, 50].forEach(num => {
    const option = document.createElement('option');
    option.value = num;
    option.textContent = `Mostra ${num}`;
    if (num === perPagina) option.selected = true;
    perPageSelect.appendChild(option);
  });
  perPageSelect.addEventListener('change', e => {
    perPagina = parseInt(e.target.value);
    paginaCorrente = 1;
    renderizzaWorkflow();
  });
  document.querySelector('.filtro-ricerca').appendChild(perPageSelect);
}

function renderizzaWorkflow() {
  const container = document.getElementById('elencoWorkflow');
  container.innerHTML = '';

  const filtroTesto = document.getElementById('filtroCodice').value.toLowerCase();
  const soloNonValidati = document.getElementById('soloNonCompletati').checked;

  const prodottiFiltrati = prodottiGlobali.filter(p => {
    const workflow = workflowGlobali[p.id];
    const testoMatch = p.codice_prodotto.toLowerCase().includes(filtroTesto);
    if (!workflow) return true; // mostra sempre anche quelli senza workflow
    const validatoMatch = soloNonValidati ? workflow.validato_finale === 0 : true;
    return testoMatch && validatoMatch;
  });

  const totalePagine = Math.ceil(prodottiFiltrati.length / perPagina);
  const start = (paginaCorrente - 1) * perPagina;
  const visibili = prodottiFiltrati.slice(start, start + perPagina);

  const info = document.createElement('p');
  info.textContent = `Mostrati ${start + 1}–${Math.min(start + visibili.length, prodottiFiltrati.length)} di ${prodottiFiltrati.length}`;
  info.style.marginBottom = '1rem';
  container.appendChild(info);

  visibili.forEach(prodotto => {
    const wrapper = document.createElement('div');
    wrapper.className = 'workflow-box';

    const titolo = document.createElement('h3');
    titolo.textContent = `${prodotto.codice_prodotto} (ID ${prodotto.id})`;
    wrapper.appendChild(titolo);

    const workflow = workflowGlobali[prodotto.id];
    if (!workflow) {
      const errore = document.createElement('p');
      errore.textContent = '⚠️ Nessun workflow associato a questo prodotto.';
      errore.style.color = 'red';
      wrapper.appendChild(errore);
      container.appendChild(wrapper);
      return;
    }

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
