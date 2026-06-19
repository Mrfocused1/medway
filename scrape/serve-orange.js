const http = require('http');
const fs = require('fs');
const path = require('path');
const SITE = path.join(__dirname, '..', 'site-orange');
const types = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.txt':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2','.glb':'model/gltf-binary' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(SITE, p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404 ' + p); }
    res.writeHead(200, { 'Content-Type': types[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'Pragma': 'no-cache', 'Expires': '0' });
    res.end(data);
  });
}).listen(4322, () => console.log('ORANGE site on http://localhost:4322'));
