const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server Node.js attivo!');
});
server.listen(3000, () => {
  console.log('Server in ascolto su http://localhost:3000');
});
