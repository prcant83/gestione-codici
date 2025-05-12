// Caricamento moduli HTML (header e footer)
async function loadPartial(id, file) {
  const res = await fetch(`partials/${file}`);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadPartial('header', 'header.html');
loadPartial('footer', 'footer.html');
