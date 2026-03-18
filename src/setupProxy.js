/**
 * Proxy /api/* to the local API server (port 3001).
 * Run the API server so /api/kundli-match works:
 *   Option A: npm run dev        (starts both API server + React in one go)
 *   Option B: in a second terminal run: npm run dev:api
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      onError: (err, req, res) => {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'API server not running. Start it with: npm run dev:api (or use npm run dev to run both)',
          })
        );
      },
    })
  );
};
