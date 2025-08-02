#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

console.log('🔍 Checking production build...');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist');
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html does not exist in dist');
  process.exit(1);
}

// Check if assets directory exists
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('❌ assets directory does not exist in dist');
  process.exit(1);
}

// Read index.html and check for SPA routing meta tags
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Add SPA routing meta tags if they don't exist
let updatedContent = indexContent;

// Add viewport meta tag if missing
if (!indexContent.includes('name="viewport"')) {
  updatedContent = updatedContent.replace(
    '<head>',
    '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
  );
}

// Add description meta tag for better SEO
if (!indexContent.includes('name="description"')) {
  updatedContent = updatedContent.replace(
    '<head>',
    '<head>\n    <meta name="description" content="Poultry Mitra - Complete poultry farm management solution with FCR calculator, batch management, and dealer network">'
  );
}

// Add canonical URL handling
if (!indexContent.includes('rel="canonical"')) {
  updatedContent = updatedContent.replace(
    '<head>',
    '<head>\n    <link rel="canonical" href="/">'
  );
}

// Add robots meta tag
if (!indexContent.includes('name="robots"')) {
  updatedContent = updatedContent.replace(
    '<head>',
    '<head>\n    <meta name="robots" content="index, follow">'
  );
}

// Write updated content back if changes were made
if (updatedContent !== indexContent) {
  fs.writeFileSync(indexPath, updatedContent);
  console.log('✅ Updated index.html with SEO and SPA meta tags');
}

// Create _redirects file for various hosting platforms
const redirectsContent = `# SPA routing fallback
/*    /index.html   200

# Specific route fallbacks for better caching
/farmer-login    /index.html   200
/dealer-login    /index.html   200
/admin-login     /index.html   200
/farmer/*        /index.html   200
/dealer/*        /index.html   200
/admin/*         /index.html   200
`;

fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
console.log('✅ Created _redirects file for SPA routing');

// Create netlify.toml for Netlify deployments
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;

fs.writeFileSync(path.join(distDir, 'netlify.toml'), netlifyToml);
console.log('✅ Created netlify.toml for Netlify deployments');

console.log('🎉 Production build check completed successfully!');
console.log(`📊 Build size: ${fs.readdirSync(distDir).length} files/folders in dist`);

// List important files
const importantFiles = ['index.html', '_redirects', 'netlify.toml'];
importantFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  }
});
