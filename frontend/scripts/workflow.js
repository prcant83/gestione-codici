// frontend/scripts/workflow.js
let ruoloUtente = null;

// Recupera ruolo utente e carica lista prodotti con workflow
fetch('/api/utente')
  .then(res => res.json())
  .then(user => {
    ruoloUtente = user.ruolo;
    caricaWorkflow();
  })
  .catch(err => {
    document.getElementById('elencoWorkflow').innerHTML = '<p>Errore: utente non autenticato</p>';
    console.error(err);
  });

function caricaWorkflow() {
  fetch('/api/prodotti')
    .then(res => res.json())
    .then(prodotti => {
      const container = document.getElementById('elencoWorkflow');
      container.innerHTML = '';

      prodotti.forEach(prodotto => {
        const wrapper = document.createElement('div');
        wrapper.className = 'workflow-box';

        const titolo = document.createElement('h3');
        titolo.textContent = prodotto.codice_prodotto;
        wrapper.appendChild(titolo);

        fetch(`/api/workflow/${prodotto.id}`)
          .then(res => res.json())
          .then(workflow => {
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
      });
    });
}

function aggiornaWorkflow(idProdotto, ruolo) {
  fetch(`/api/workflow/${idProdotto}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: `Confermato da ${ruolo}` })
  })
    .then(res => res.json())
    .then(() => caricaWorkflow())
    .catch(err => console.error('Errore aggiornamento:', err));
}
