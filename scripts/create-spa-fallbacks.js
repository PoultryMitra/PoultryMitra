#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes that need SPA fallback
const routes = [
  'admin-login',
  'login', 
  'register',
  'farmer-login',
  'dealer-login',
  'complete-profile',
  'farmer',
  'dealer', 
  'admin'
];

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

// Read the main index.html
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Create directories and copy index.html for each route
routes.forEach(route => {
  const routeDir = path.join(distDir, route);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  // Copy index.html to route/index.html
  const routeIndexPath = path.join(routeDir, 'index.html');
  fs.writeFileSync(routeIndexPath, indexContent);
  
  console.log(`Created: ${route}/index.html`);
});

console.log('SPA fallback pages created successfully!');
