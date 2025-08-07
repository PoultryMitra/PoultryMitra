/**
 * LibreTranslate API Test Script
 * Tests the LibreTranslate integration and functionality
 */

import { libreTranslateService } from '../src/services/libreTranslateService.js';

// Test configuration
const TEST_TEXTS = {
  simple: {
    en: "Hello, how are you?",
    hi: "नमस्ते, आप कैसे हैं?"
  },
  complex: {
    en: "Poultry farm management is essential for successful chicken breeding and optimal feed conversion ratio.",
    hi: "पोल्ट्री फार्म प्रबंधन सफल मुर्गी पालन और इष्टतम फीड रूपांतरण अनुपात के लिए आवश्यक है।"
  },
  technical: {
    en: "Feed Conversion Ratio (FCR) is calculated by dividing total feed consumed by total weight gain.",
    hi: "फीड रूपांतरण अनुपात (एफसीआर) की गणना कुल फीड खपत को कुल वजन बढ़ने से भाग देकर की जाती है।"
  }
};

// Test colors for console output
const colors = {
  green: '\x1b[32m%s\x1b[0m',
  red: '\x1b[31m%s\x1b[0m',
  yellow: '\x1b[33m%s\x1b[0m',
  blue: '\x1b[34m%s\x1b[0m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(colors[color], message);
}

// Test functions
async function testServiceHealth() {
  log('blue', '\n🔍 Testing LibreTranslate Service Health...');
  try {
    const isHealthy = await libreTranslateService.checkServiceHealth();
    if (isHealthy) {
      log('green', '✅ LibreTranslate service is healthy and accessible');
      return true;
    } else {
      log('red', '❌ LibreTranslate service is not accessible');
      return false;
    }
  } catch (error) {
    log('red', `❌ Service health check failed: ${error.message}`);
    return false;
  }
}

async function testLanguageDetection() {
  log('blue', '\n🔍 Testing Language Detection...');
  try {
    const englishText = "This is an English sentence for testing.";
    const hindiText = "यह हिंदी भाषा में एक वाक्य है।";
    
    const englishLang = await libreTranslateService.detectLanguage(englishText);
    const hindiLang = await libreTranslateService.detectLanguage(hindiText);
    
    log('green', `✅ English detection: "${englishText}" → ${englishLang}`);
    log('green', `✅ Hindi detection: "${hindiText}" → ${hindiLang}`);
    
    return englishLang === 'en' && hindiLang === 'hi';
  } catch (error) {
    log('red', `❌ Language detection failed: ${error.message}`);
    return false;
  }
}

async function testSingleTranslation() {
  log('blue', '\n🔍 Testing Single Text Translation...');
  let successCount = 0;
  
  for (const [category, texts] of Object.entries(TEST_TEXTS)) {
    try {
      // Test English to Hindi
      const enToHi = await libreTranslateService.translateText({
        text: texts.en,
        source: 'en',
        target: 'hi'
      });
      
      // Test Hindi to English
      const hiToEn = await libreTranslateService.translateText({
        text: texts.hi,
        source: 'hi',
        target: 'en'
      });
      
      log('green', `✅ ${category.toUpperCase()} - EN→HI:`);
      console.log(`   Original: ${texts.en}`);
      console.log(`   Translated: ${enToHi.translatedText}`);
      
      log('green', `✅ ${category.toUpperCase()} - HI→EN:`);
      console.log(`   Original: ${texts.hi}`);
      console.log(`   Translated: ${hiToEn.translatedText}`);
      
      successCount += 2;
    } catch (error) {
      log('red', `❌ Translation failed for ${category}: ${error.message}`);
    }
  }
  
  return successCount;
}

async function testBatchTranslation() {
  log('blue', '\n🔍 Testing Batch Translation...');
  try {
    const textsToTranslate = [
      "Welcome to Poultry Management System",
      "Add New Batch",
      "Feed Conversion Ratio",
      "Vaccine Reminder",
      "Total Birds"
    ];
    
    const results = await libreTranslateService.batchTranslate({
      texts: textsToTranslate,
      source: 'en',
      target: 'hi'
    });
    
    log('green', '✅ Batch Translation Results:');
    results.forEach((result, index) => {
      console.log(`   ${textsToTranslate[index]} → ${result.translatedText}`);
    });
    
    return results.length === textsToTranslate.length;
  } catch (error) {
    log('red', `❌ Batch translation failed: ${error.message}`);
    return false;
  }
}

async function testErrorHandling() {
  log('blue', '\n🔍 Testing Error Handling...');
  try {
    // Test with invalid language code
    await libreTranslateService.translateText({
      text: "Test text",
      source: 'invalid',
      target: 'hi'
    });
    log('red', '❌ Error handling test failed - should have thrown an error');
    return false;
  } catch (error) {
    log('green', `✅ Error handling works correctly: ${error.message}`);
    return true;
  }
}

async function testUIIntegration() {
  log('blue', '\n🔍 Testing UI Integration Components...');
  
  // Simulate testing translation context
  const mockTranslations = {
    'batch.title': 'Batch Management',
    'batch.addNew': 'Add New Batch',
    'vaccine.reminder': 'Vaccine Reminder'
  };
  
  try {
    let testsPassed = 0;
    
    // Test translation key lookup
    for (const [key, expectedText] of Object.entries(mockTranslations)) {
      const translated = await libreTranslateService.translateText({
        text: expectedText,
        source: 'en',
        target: 'hi'
      });
      
      if (translated.translatedText) {
        log('green', `✅ UI Translation: "${expectedText}" → "${translated.translatedText}"`);
        testsPassed++;
      }
    }
    
    return testsPassed === Object.keys(mockTranslations).length;
  } catch (error) {
    log('red', `❌ UI integration test failed: ${error.message}`);
    return false;
  }
}

async function testPerformance() {
  log('blue', '\n🔍 Testing Translation Performance...');
  
  const testText = "This is a performance test for LibreTranslate API response time.";
  const iterations = 5;
  const times = [];
  
  try {
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      await libreTranslateService.translateText({
        text: testText,
        source: 'en',
        target: 'hi'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    log('green', `✅ Performance Results:`);
    console.log(`   Average response time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Minimum response time: ${minTime}ms`);
    console.log(`   Maximum response time: ${maxTime}ms`);
    
    return avgTime < 3000; // Consider it good if average is under 3 seconds
  } catch (error) {
    log('red', `❌ Performance test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('yellow', '🚀 Starting LibreTranslate Comprehensive Test Suite...\n');
  
  const results = {
    serviceHealth: false,
    languageDetection: false,
    singleTranslation: 0,
    batchTranslation: false,
    errorHandling: false,
    uiIntegration: false,
    performance: false
  };
  
  // Run all tests
  results.serviceHealth = await testServiceHealth();
  
  if (results.serviceHealth) {
    results.languageDetection = await testLanguageDetection();
    results.singleTranslation = await testSingleTranslation();
    results.batchTranslation = await testBatchTranslation();
    results.errorHandling = await testErrorHandling();
    results.uiIntegration = await testUIIntegration();
    results.performance = await testPerformance();
  } else {
    log('yellow', '⚠️  Skipping other tests due to service health failure');
  }
  
  // Print summary
  log('yellow', '\n📊 TEST SUMMARY:');
  console.log('='.repeat(50));
  
  log(results.serviceHealth ? 'green' : 'red', 
      `Service Health: ${results.serviceHealth ? 'PASS' : 'FAIL'}`);
  
  log(results.languageDetection ? 'green' : 'red', 
      `Language Detection: ${results.languageDetection ? 'PASS' : 'FAIL'}`);
  
  log(results.singleTranslation > 0 ? 'green' : 'red', 
      `Single Translation: ${results.singleTranslation}/6 PASS`);
  
  log(results.batchTranslation ? 'green' : 'red', 
      `Batch Translation: ${results.batchTranslation ? 'PASS' : 'FAIL'}`);
  
  log(results.errorHandling ? 'green' : 'red', 
      `Error Handling: ${results.errorHandling ? 'PASS' : 'FAIL'}`);
  
  log(results.uiIntegration ? 'green' : 'red', 
      `UI Integration: ${results.uiIntegration ? 'PASS' : 'FAIL'}`);
  
  log(results.performance ? 'green' : 'red', 
      `Performance: ${results.performance ? 'PASS' : 'FAIL'}`);
  
  console.log('='.repeat(50));
  
  const totalTests = Object.values(results).filter(Boolean).length;
  const passedTests = Object.values(results).filter(result => 
    typeof result === 'boolean' ? result : result > 0
  ).length;
  
  if (passedTests === Object.keys(results).length) {
    log('green', `🎉 ALL TESTS PASSED (${passedTests}/${Object.keys(results).length})`);
    log('green', '✅ LibreTranslate integration is working perfectly!');
  } else {
    log('yellow', `⚠️  PARTIAL SUCCESS (${passedTests}/${Object.keys(results).length} tests passed)`);
    if (!results.serviceHealth) {
      log('red', '❌ LibreTranslate service is not accessible. Check:');
      console.log('   - Internet connection');
      console.log('   - LibreTranslate server status');
      console.log('   - API endpoints configuration');
    }
  }
  
  return results;
}

// Export for use in other files
export { runAllTests, testServiceHealth, testSingleTranslation };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}
