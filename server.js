const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 3000;

// Headers argentinos
const ARGENTINA_HEADERS = {
  'X-Forwarded-For': '200.1.1.1',
  'X-Real-IP': '200.1.1.1',
  'CF-Connecting-IP': '200.1.1.1',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'Accept-Language': 'es-AR,es;q=0.9'
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parsea URL destino
  const targetUrl = req.url.replace('/proxy?url=', '');
  if (!targetUrl || targetUrl === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>✓ Proxy Argentina Activo</h1>
      <p>Uso: /proxy?url=https://ejemplo.com</p>
    `);
    return;
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    const parsedUrl = new URL(decodedUrl);

    // Configura headers para request
    const proxyReq = (parsedUrl.protocol === 'https:' ? https : http).request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: req.method,
        headers: {
          ...ARGENTINA_HEADERS,
          'Host': parsedUrl.hostname,
          'Connection': 'close'
        }
      },
      (proxyRes) => {
        // Pasa headers de respuesta
        Object.keys(proxyRes.headers).forEach(key => {
          res.setHeader(key, proxyRes.headers[key]);
        });
        res.writeHead(proxyRes.statusCode);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error('Error:', err.message);
      res.writeHead(500);
      res.end(`Error: ${err.message}`);
    });

    req.pipe(proxyReq);
  } catch (err) {
    res.writeHead(400);
    res.end(`URL inválida: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`✓ Proxy Argentina en http://localhost:${PORT}`);
  console.log(`✓ IP simulada: 200.1.1.1`);
  console.log(`✓ Ubicación: Buenos Aires, AR`);
});
