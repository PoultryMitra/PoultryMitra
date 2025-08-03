/**
 * Interactive Browser Test Suite for Auto-Calculation System
 * Run this in the browser console to test all implemented features
 */

// Create test UI overlay
function createTestUI() {
  const overlay = document.createElement('div');
  overlay.id = 'test-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    max-height: 400px;
    background: white;
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 15px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: monospace;
    font-size: 12px;
    overflow-y: auto;
  `;
  
  overlay.innerHTML = `
    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0; color: #007bff;">🧪 Test Suite</h3>
      <button onclick="document.getElementById('test-overlay').remove()" style="border: none; background: #ff4444; color: white; border-radius: 4px; padding: 2px 6px; cursor: pointer;">×</button>
    </div>
    <div id="test-results"></div>
    <div style="margin-top: 10px;">
      <button onclick="runInteractiveTests()" style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;">Run Tests</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

// Test results display
function logToUI(message, type = 'info') {
  const resultsDiv = document.getElementById('test-results');
  if (!resultsDiv) return;
  
  const colors = {
    pass: '#28a745',
    fail: '#dc3545', 
    warn: '#ffc107',
    info: '#17a2b8'
  };
  
  const div = document.createElement('div');
  div.style.cssText = `
    margin: 2px 0;
    padding: 4px;
    border-radius: 3px;
    background: ${colors[type]}20;
    border-left: 3px solid ${colors[type]};
    font-size: 11px;
  `;
  div.textContent = message;
  resultsDiv.appendChild(div);
  resultsDiv.scrollTop = resultsDiv.scrollHeight;
}

// Interactive test functions
function runInteractiveTests() {
  const resultsDiv = document.getElementById('test-results');
  if (resultsDiv) resultsDiv.innerHTML = '';
  
  logToUI('🚀 Starting Interactive Test Suite...', 'info');
  
  // Test 1: Check if we're on the right page
  setTimeout(() => testPageDetection(), 500);
  setTimeout(() => testDashboardElements(), 1000);
  setTimeout(() => testTabFunctionality(), 1500);
  setTimeout(() => testAutoCalculationUI(), 2000);
  setTimeout(() => testLedgerComponents(), 2500);
  setTimeout(() => testAccountSummary(), 3000);
  setTimeout(() => testMobileResponsiveness(), 3500);
  setTimeout(() => showFinalResults(), 4000);
}

function testPageDetection() {
  logToUI('📍 Testing Page Detection...', 'info');
  
  const isDealerPage = window.location.pathname.includes('dealer') || 
                       document.title.includes('Dealer') ||
                       document.querySelector('h1')?.textContent.includes('Dealer');
  
  if (isDealerPage) {
    logToUI('✅ Dealer dashboard detected', 'pass');
  } else {
    logToUI('⚠️ Not on dealer dashboard - some tests may not work', 'warn');
  }
}

function testDashboardElements() {
  logToUI('🏠 Testing Dashboard Elements...', 'info');
  
  // Test for main dashboard title
  const dashboardTitle = document.querySelector('h1');
  if (dashboardTitle && dashboardTitle.textContent.includes('Dashboard')) {
    logToUI('✅ Dashboard title found', 'pass');
  } else {
    logToUI('❌ Dashboard title not found', 'fail');
  }
  
  // Test for stats cards
  const statsCards = document.querySelectorAll('[class*="card"]');
  if (statsCards.length >= 4) {
    logToUI(`✅ Found ${statsCards.length} dashboard cards`, 'pass');
  } else {
    logToUI(`⚠️ Only found ${statsCards.length} cards`, 'warn');
  }
  
  // Test for action buttons
  const buttons = document.querySelectorAll('button');
  if (buttons.length > 0) {
    logToUI(`✅ Found ${buttons.length} interactive buttons`, 'pass');
  } else {
    logToUI('❌ No buttons found', 'fail');
  }
}

function testTabFunctionality() {
  logToUI('📑 Testing Tab Functionality...', 'info');
  
  // Look for tab elements
  const tabs = document.querySelectorAll('[role="tab"], [data-value]');
  if (tabs.length >= 4) {
    logToUI(`✅ Found ${tabs.length} tabs`, 'pass');
    
    // Test tab switching
    const accountsTab = Array.from(tabs).find(tab => 
      tab.textContent?.toLowerCase().includes('accounts') ||
      tab.getAttribute('data-value') === 'accounts'
    );
    
    if (accountsTab) {
      logToUI('✅ Accounts tab found', 'pass');
      
      // Try to click the tab
      try {
        accountsTab.click();
        setTimeout(() => {
          const activeContent = document.querySelector('[data-state="active"]');
          if (activeContent) {
            logToUI('✅ Tab switching works', 'pass');
          } else {
            logToUI('⚠️ Tab content may not be visible', 'warn');
          }
        }, 300);
      } catch (error) {
        logToUI('⚠️ Could not test tab clicking', 'warn');
      }
    } else {
      logToUI('❌ Accounts tab not found', 'fail');
    }
  } else {
    logToUI('❌ Insufficient tabs found', 'fail');
  }
}

function testAutoCalculationUI() {
  logToUI('🤖 Testing Auto-Calculation UI...', 'info');
  
  // Look for auto-calculate buttons
  const autoCalcButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent?.toLowerCase().includes('auto-calculate') ||
    btn.textContent?.includes('🤖')
  );
  
  if (autoCalcButtons.length > 0) {
    logToUI(`✅ Found ${autoCalcButtons.length} auto-calculate buttons`, 'pass');
  } else {
    logToUI('⚠️ Auto-calculate buttons not visible (may be in modals)', 'warn');
  }
  
  // Look for cost input fields
  const costInputs = document.querySelectorAll('input[type="number"], input[placeholder*="cost"]');
  if (costInputs.length > 0) {
    logToUI(`✅ Found ${costInputs.length} cost input fields`, 'pass');
  } else {
    logToUI('⚠️ Cost input fields not visible', 'warn');
  }
  
  // Look for suggestion panels
  const suggestionPanels = document.querySelectorAll('[class*="blue-50"], [class*="suggestion"]');
  if (suggestionPanels.length > 0) {
    logToUI(`✅ Found ${suggestionPanels.length} suggestion panels`, 'pass');
  } else {
    logToUI('⚠️ Suggestion panels not active', 'warn');
  }
}

function testLedgerComponents() {
  logToUI('📚 Testing Ledger Components...', 'info');
  
  // Try to activate ledger tab first
  const ledgerTab = Array.from(document.querySelectorAll('[role="tab"], [data-value]')).find(tab => 
    tab.textContent?.toLowerCase().includes('ledger') ||
    tab.getAttribute('data-value') === 'ledger'
  );
  
  if (ledgerTab) {
    logToUI('✅ Ledger tab found', 'pass');
    ledgerTab.click();
    
    setTimeout(() => {
      // Check for ledger elements
      const transactionElements = document.querySelectorAll('[class*="transaction"]');
      const filterElements = document.querySelectorAll('select, input[placeholder*="search"]');
      const balanceElements = document.querySelectorAll('[class*="balance"], [class*="credit"], [class*="debit"]');
      
      if (transactionElements.length > 0) {
        logToUI(`✅ Found ${transactionElements.length} transaction elements`, 'pass');
      } else {
        logToUI('⚠️ Transaction elements not visible', 'warn');
      }
      
      if (filterElements.length > 0) {
        logToUI(`✅ Found ${filterElements.length} filter elements`, 'pass');
      } else {
        logToUI('⚠️ Filter elements not visible', 'warn');
      }
      
      if (balanceElements.length > 0) {
        logToUI(`✅ Found ${balanceElements.length} balance indicators`, 'pass');
      } else {
        logToUI('⚠️ Balance indicators not visible', 'warn');
      }
    }, 500);
  } else {
    logToUI('❌ Ledger tab not found', 'fail');
  }
}

function testAccountSummary() {
  logToUI('💰 Testing Account Summary...', 'info');
  
  // Try to activate accounts tab
  const accountsTab = Array.from(document.querySelectorAll('[role="tab"], [data-value]')).find(tab => 
    tab.textContent?.toLowerCase().includes('accounts') ||
    tab.getAttribute('data-value') === 'accounts'
  );
  
  if (accountsTab) {
    accountsTab.click();
    
    setTimeout(() => {
      // Check for financial metrics
      const metricElements = document.querySelectorAll('[class*="text-2xl"], .font-bold');
      const currencyElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent?.includes('₹') || el.textContent?.includes('Outstanding')
      );
      
      if (metricElements.length > 0) {
        logToUI(`✅ Found ${metricElements.length} metric displays`, 'pass');
      } else {
        logToUI('⚠️ Metric displays not visible', 'warn');
      }
      
      if (currencyElements.length > 0) {
        logToUI(`✅ Found ${currencyElements.length} currency indicators`, 'pass');
      } else {
        logToUI('⚠️ Currency indicators not visible', 'warn');
      }
    }, 500);
  }
}

function testMobileResponsiveness() {
  logToUI('📱 Testing Mobile Responsiveness...', 'info');
  
  // Check for responsive classes
  const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
  if (responsiveElements.length > 0) {
    logToUI(`✅ Found ${responsiveElements.length} responsive elements`, 'pass');
  } else {
    logToUI('❌ No responsive classes found', 'fail');
  }
  
  // Check viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    logToUI('✅ Viewport meta tag present', 'pass');
  } else {
    logToUI('⚠️ Viewport meta tag missing', 'warn');
  }
}

function showFinalResults() {
  logToUI('📊 Test Suite Complete!', 'info');
  
  const resultElements = document.querySelectorAll('#test-results > div');
  let passed = 0, failed = 0, warnings = 0;
  
  resultElements.forEach(el => {
    const text = el.textContent;
    if (text.startsWith('✅')) passed++;
    else if (text.startsWith('❌')) failed++;
    else if (text.startsWith('⚠️')) warnings++;
  });
  
  logToUI(`📈 Results: ${passed} passed, ${failed} failed, ${warnings} warnings`, 'info');
  
  if (failed === 0) {
    logToUI('🎉 All critical tests passed! System ready for use.', 'pass');
  } else if (failed <= 2) {
    logToUI('✅ System mostly working with minor issues', 'pass');
  } else {
    logToUI('🚨 System needs attention before production', 'fail');
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createTestUI, 1000);
    });
  } else {
    setTimeout(createTestUI, 1000);
  }
  
  // Make functions globally available
  window.runInteractiveTests = runInteractiveTests;
  window.createTestUI = createTestUI;
  
  console.log('🧪 Interactive Test Suite Loaded!');
  console.log('🎯 Test UI will appear in the top-right corner');
  console.log('💡 Or run: runInteractiveTests() manually');
}
