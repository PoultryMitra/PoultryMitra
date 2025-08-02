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
const redirectsContent = `# SPA routing fallback for Render.com and other platforms
# IMPORTANT: For Render.com, this file must be in the root of the build output

# Static assets should be served as-is
/assets/*               /assets/:splat              200
/*.js                   /:splat                     200
/*.css                  /:splat                     200
/*.png                  /:splat                     200
/*.jpg                  /:splat                     200
/*.jpeg                 /:splat                     200
/*.gif                  /:splat                     200
/*.svg                  /:splat                     200
/*.ico                  /:splat                     200
/*.woff                 /:splat                     200
/*.woff2                /:splat                     200
/*.ttf                  /:splat                     200
/*.eot                  /:splat                     200
/*.json                 /:splat                     200
/*.xml                  /:splat                     200
/*.txt                  /:splat                     200

# API routes should not be redirected (if any)
/api/*                  /api/:splat                 200

# Specific important routes for better SEO
/farmer-login           /index.html                 200
/dealer-login           /index.html                 200
/admin-login            /index.html                 200
/farmer/*               /index.html                 200
/dealer/*               /index.html                 200
/admin/*                /index.html                 200
/register               /index.html                 200
/login                  /index.html                 200
/farmer-connect         /index.html                 200
/complete-profile       /index.html                 200

# Catch-all rule for SPA routing (MUST be last)
/*                      /index.html                 200
`;

fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
console.log('✅ Created _redirects file for SPA routing (Render.com compatible)');

// Create _headers file for Render.com
const headersContent = `# Headers for Render.com deployment
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff  
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: no-cache

# Cache static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Cache JS and CSS
*.js
  Cache-Control: public, max-age=86400

*.css
  Cache-Control: public, max-age=86400
`;

fs.writeFileSync(path.join(distDir, '_headers'), headersContent);
console.log('✅ Created _headers file for Render.com');

// Debug info for Render.com deployment
console.log('');
console.log('🔧 Render.com Deployment Debug Info:');
console.log('   - Build output: ./dist');
console.log('   - SPA routing: _redirects file created');
console.log('   - Headers: _headers file created');
console.log('   - Environment variables: Set in render.yaml');

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
