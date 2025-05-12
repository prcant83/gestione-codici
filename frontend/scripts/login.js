document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-box');

  form.addEventListener('submit', (e) => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      e.preventDefault();
      alert('Inserisci sia username che password.');
    } else {
      // Potresti aggiungere animazioni o indicatori di caricamento qui
      console.log('Login in corso...');
    }
  });
});
