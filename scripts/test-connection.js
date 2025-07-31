/**
 * Simple test script for dealer connection functionality
 * Run with: node scripts/test-connection.js
 */

import fs from 'fs';
import path from 'path';

const testDealerCodes = [
  'DEAL123',
  'TEST456',
  'DEMO789',
  'INVALID',
  '',
  null,
  undefined
];

console.log('🧪 Starting Dealer Connection Tests');
console.log('=====================================');

// Mock test function since we can't import React components directly
function mockValidateInvitationCode(code) {
  console.log(`📡 Testing code: "${code}"`);
  
  // Simulate validation logic
  if (!code || code.trim() === '') {
    return Promise.resolve({ valid: false, error: 'Empty code' });
  }
  
  if (code.trim() === 'INVALID') {
    return Promise.resolve({ valid: false, error: 'Invalid code' });
  }
  
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        valid: true,
        data: {
          dealerId: `dealer-${code.toLowerCase()}`,
          dealerName: `Test Dealer ${code}`,
          dealerEmail: `dealer@${code.toLowerCase()}.com`
        }
      });
    }, Math.random() * 1000 + 500); // 500-1500ms delay
  });
}

async function runTests() {
  for (const code of testDealerCodes) {
    try {
      console.log(`\n🔍 Testing: ${code || 'null/undefined'}`);
      const startTime = Date.now();
      
      const result = await mockValidateInvitationCode(code);
      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Result:`, result);
      
      if (result.valid) {
        console.log(`✅ PASS: Valid dealer found`);
      } else {
        console.log(`❌ FAIL: ${result.error || 'Invalid code'}`);
      }
    } catch (error) {
      console.error(`💥 ERROR:`, error.message);
    }
  }
  
  console.log('\n🏁 Tests completed');
  console.log('\n💡 Tips for debugging:');
  console.log('1. Check browser console for detailed logs');
  console.log('2. Use the debug panel in development mode');
  console.log('3. Verify localStorage for pending codes');
  console.log('4. Check network tab for API calls');
  console.log('5. Use window.farmerConnectDebug in dev tools');
}

// Health check for the environment
function healthCheck() {
  console.log('\n🏥 Environment Health Check');
  console.log('============================');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`Script location: test-connection.js`);
  
  // Check if we're in the right directory
  const expectedFiles = ['package.json', 'vite.config.ts', 'src/pages/FarmerConnect.tsx'];
  
  for (const file of expectedFiles) {
    try {
      if (fs.existsSync(file)) {
        console.log(`✅ Found: ${file}`);
      } else {
        console.log(`❌ Missing: ${file}`);
      }
    } catch (error) {
      console.log(`❓ Error checking ${file}: ${error.message}`);
    }
  }
}

// Run the tests
healthCheck();
runTests().catch(console.error);
