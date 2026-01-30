require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const agoraRoutes = require('./routes/agora_routes');
const basicAuth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint (no auth required for monitoring)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Apply Basic Authentication to all routes below
app.use(basicAuth);

app.use(express.static(path.join(__dirname, '../frontend'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use('/src', express.static(path.join(__dirname, '../src')));
app.use('/lib', express.static(path.join(__dirname, '../node_modules'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/api/agora', agoraRoutes);

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/index.html');
  let html = require('fs').readFileSync(indexPath, 'utf8');
  
  // Inject authentication credentials into the HTML
  const authScript = `
    <script>
      window.APP_AUTH_USERNAME = ${JSON.stringify(process.env.AUTH_USERNAME || '')};
      window.APP_AUTH_PASSWORD = ${JSON.stringify(process.env.AUTH_PASSWORD || '')};
    </script>
  `;
  
  // Insert the auth script before the closing head tag
  html = html.replace('</head>', `${authScript}</head>`);
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});

module.exports = app;