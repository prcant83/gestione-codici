document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-box');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  form.addEventListener('submit', (e) => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      e.preventDefault();
      const errorBox = document.getElementById('login-error');
      if (errorBox) {
        errorBox.textContent = 'Inserisci sia username che password.';
      } else {
        alert('Inserisci sia username che password.');
      }
      return;
    }

    // Se vuoi gestire animazioni o loader visivi qui
    console.log('Login in corso...');
  });
});
