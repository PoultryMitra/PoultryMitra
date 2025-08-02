// Test script to validate authentication fixes
// Run this in browser console to test the session management

console.log('🧪 Testing Authentication System...');

// Test 1: Check if SessionManager is working
try {
  const sessionData = localStorage.getItem('userSession');
  console.log('📝 Current session:', sessionData ? JSON.parse(sessionData) : 'No session');
} catch (e) {
  console.log('❌ Session parsing error:', e);
}

// Test 2: Check Firebase auth state
import { auth } from './src/lib/firebase.js';
console.log('🔥 Firebase auth user:', auth.currentUser?.email || 'Not authenticated');

// Test 3: Check auth context state (if available)
if (window.React && window.React.useContext) {
  console.log('⚛️ React context available for testing');
} else {
  console.log('⚠️ React context not accessible from console');
}

// Test 4: Storage cleanup test
function clearAuthStorage() {
  console.log('🧹 Clearing all auth storage...');
  localStorage.removeItem('userSession');
  
  // Clear Firebase auth storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('firebase:')) {
      localStorage.removeItem(key);
      console.log('🗑️ Removed:', key);
    }
  });
  
  console.log('✅ Storage cleared. Refresh page to test clean state.');
}

// Test 5: Session validation
function validateSession() {
  const session = localStorage.getItem('userSession');
  if (!session) {
    console.log('❌ No session found');
    return false;
  }
  
  try {
    const data = JSON.parse(session);
    const age = Date.now() - data.lastLogin;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    console.log('📊 Session age:', Math.round(age / (1000 * 60 * 60)), 'hours');
    console.log('✅ Session valid:', age < maxAge);
    
    return age < maxAge;
  } catch (e) {
    console.log('❌ Session validation error:', e);
    return false;
  }
}

// Export test functions to window for easy access
window.authTests = {
  clearAuthStorage,
  validateSession,
  checkAuthState: () => {
    console.log('🔍 Auth State Check:');
    console.log('- Firebase user:', auth.currentUser?.email || 'None');
    console.log('- Session valid:', validateSession());
    console.log('- Storage keys:', Object.keys(localStorage).filter(k => k.includes('session') || k.includes('firebase')));
  }
};

console.log('✅ Auth tests loaded. Use window.authTests to run individual tests:');
console.log('- window.authTests.checkAuthState()');
console.log('- window.authTests.validateSession()');
console.log('- window.authTests.clearAuthStorage()');
