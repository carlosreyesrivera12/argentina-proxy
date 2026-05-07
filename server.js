const https = require('https');
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Headers argentinos
const ARGENTINA_HEADERS = {
  'X-Forwarded-For': '200.1.1.1',
  'X-Real-IP': '200.1.1.1',
  'CF-Connecting-IP': '200.1.1.1',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'es-AR,es;q=0.9'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Root
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>✓ Proxy Argentina Activo</h1>
      <p>IP: 200.1.1.1</p>
      <p>Ubicación: Buenos Aires, AR</p>
    `);
    return;
  }

  // Parsea URL destino
  const urlMatch = req.url.match(/^\/proxy\?url=(.+)$/);
  if (!urlMatch) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Uso: /proxy?url=https://ejemplo.com');
    return;
  }

  try {
    const decodedUrl = decodeURIComponent(urlMatch[1]);
    const parsedUrl = new URL(decodedUrl);

    // Headers para el request
    const reqHeaders = {
      ...ARGENTINA_HEADERS,
      'Host': parsedUrl.hostname,
      'Connection': 'keep-alive'
    };

    // Copia headers relevantes del request original
    ['cookie', 'referer', 'accept', 'content-type', 'content-length'].forEach(h => {
      if (req.headers[h]) reqHeaders[h] = req.headers[h];
    });

    const proxyReq = (parsedUrl.protocol === 'https:' ? https : http).request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: req.method,
        headers: reqHeaders,
        timeout: 10000
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`Proxy Error: ${err.message}`);
    });

    req.pipe(proxyReq);
  } catch (err) {
    console.error('Parse error:', err.message);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`URL inválida: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`✓ Proxy Argentina en puerto ${PORT}`);
  console.log(`✓ IP simulada: 200.1.1.1`);
  console.log(`✓ Ubicación: Buenos Aires, AR`);
});
