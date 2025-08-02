#!/usr/bin/env node

// Test the production build locally to ensure it works
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const distPath = path.join(__dirname, '..', 'dist');

// Serve static files
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  console.log(`Serving ${req.path} -> index.html`);
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server Error');
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Production test server running at http://localhost:${port}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log('🔗 Test these routes:');
  console.log('  - http://localhost:3000/farmer-login');
  console.log('  - http://localhost:3000/dealer-login');
  console.log('  - http://localhost:3000/farmer/dashboard');
  console.log('  - http://localhost:3000/dealer/dashboard');
  console.log('');
  console.log('💡 Refresh any page to test SPA routing');
});
