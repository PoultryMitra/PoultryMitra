// Check current authentication state
console.log('=== Authentication Debug ===');
console.log('localStorage userId:', localStorage.getItem('userId'));
console.log('localStorage userRole:', localStorage.getItem('userRole'));
console.log('localStorage user:', localStorage.getItem('user'));

// Check if Firebase auth is initialized
import { auth } from './src/lib/firebase.js';
console.log('Firebase auth current user:', auth.currentUser);

if (auth.currentUser) {
  console.log('Firebase user UID:', auth.currentUser.uid);
  console.log('Firebase user email:', auth.currentUser.email);
  console.log('Firebase user displayName:', auth.currentUser.displayName);
} else {
  console.log('No Firebase user currently authenticated');
}
