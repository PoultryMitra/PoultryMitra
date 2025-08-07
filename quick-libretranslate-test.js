/**
 * Quick LibreTranslate Test
 * Simple test to verify if LibreTranslate is working
 */

// Quick test without ES modules for immediate execution
const testLibreTranslate = async () => {
  console.log('🔍 Testing LibreTranslate API...\n');

  // Test URLs to try
  const testUrls = [
    'https://libretranslate.com/translate',
    'https://translate.argosopentech.com/translate'
  ];

  const testText = "Hello, how are you?";
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: testText,
          source: 'en',
          target: 'hi',
          format: 'text'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SUCCESS!');
        console.log(`Original: ${testText}`);
        console.log(`Translated: ${result.translatedText}`);
        console.log(`API URL: ${url}\n`);
        return true;
      } else {
        console.log(`❌ Failed with status: ${response.status}`);
        console.log(`Response: ${await response.text()}\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('❌ All LibreTranslate services failed');
  return false;
};

// Test with Node.js fetch (for Node 18+) or fallback
const runTest = async () => {
  try {
    // Check if fetch is available (Node 18+)
    if (typeof fetch === 'undefined') {
      console.log('❌ fetch is not available. Please use Node.js 18+ or install node-fetch');
      console.log('To install node-fetch: npm install node-fetch');
      return;
    }
    
    const success = await testLibreTranslate();
    
    if (success) {
      console.log('🎉 LibreTranslate is working! You can now use it in your React app.');
    } else {
      console.log('⚠️  LibreTranslate services are not accessible.');
      console.log('This might be due to:');
      console.log('- Network issues');
      console.log('- Service being down');
      console.log('- CORS restrictions (should work in React app)');
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
};

// Run the test
runTest();
