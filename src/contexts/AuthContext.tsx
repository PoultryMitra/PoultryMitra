import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'farmer' | 'dealer' | 'admin';
  phone?: string;
  location?: string;
  farmSize?: string;
  birdCount?: number;
  businessName?: string;
  clientCount?: number;
  createdAt: Date;
  lastActive: Date;
  profileComplete?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: (useRedirect?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await loadUserProfile(result.user.uid);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register new user
  const register = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userData.displayName) {
        await updateProfile(result.user, { displayName: userData.displayName });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName: userData.displayName || '',
        role: userData.role || 'farmer',
        createdAt: new Date(),
        lastActive: new Date(),
        profileComplete: true // Email registration has complete profile
      };

      // Only add optional fields if they have values
      if (userData.phone) userProfile.phone = userData.phone;
      if (userData.location) userProfile.location = userData.location;
      if (userData.farmSize) userProfile.farmSize = userData.farmSize;
      if (userData.birdCount) userProfile.birdCount = userData.birdCount;
      if (userData.businessName) userProfile.businessName = userData.businessName;
      if (userData.clientCount) userProfile.clientCount = userData.clientCount;

      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async (useRedirect = false) => {
    try {
      if (useRedirect) {
        console.log('Starting Google login with redirect mode...');
        // Use redirect to avoid CORS issues
        await signInWithRedirect(auth, googleProvider);
        // Note: The result will be handled by the auth state change listener
      } else {
        console.log('Starting Google login with popup mode...');
        // Try popup (default behavior)
        console.log('Opening Google popup...');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google popup result:', result);
        console.log('Google user:', result.user);
        await handleGoogleAuthResult(result.user);
        console.log('Google auth result handled successfully');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle specific Google OAuth errors
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-in. Please contact support.');
      } else if (error.code === 'auth/popup-blocked') {
        // If popup is blocked, automatically try redirect
        console.log('Popup blocked, trying redirect method...');
        try {
          await signInWithRedirect(auth, googleProvider);
          return; // Redirect initiated successfully
        } catch (redirectError) {
          throw new Error('Popup was blocked. Please allow popups for this site or try again.');
        }
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-in is not enabled. Please contact support.');
      } else {
        // For CORS/popup errors, try redirect as fallback
        if (error.message.includes('Cross-Origin') || error.message.includes('popup')) {
          console.log('CORS/Popup error detected, falling back to redirect...');
          try {
            await signInWithRedirect(auth, googleProvider);
            return; // Redirect initiated successfully
          } catch (redirectError) {
            throw new Error('Authentication failed. Please try again or contact support.');
          }
        }
        throw new Error(`Google Sign-in failed: ${error.message}`);
      }
    }
  };

  // Helper function to handle Google auth result
  const handleGoogleAuthResult = async (user: User) => {
    console.log('Processing Google auth result for user:', user.email);
    
    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log('User document exists:', userDoc.exists());
    
    if (!userDoc.exists()) {
      console.log('Creating new user profile...');
      // Create basic profile for Google Auth user - they'll complete it later
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || '',
        role: 'farmer', // Default role - will be updated in profile completion
        createdAt: new Date(),
        lastActive: new Date(),
        profileComplete: false // Flag to indicate profile needs completion
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      console.log('New user profile created:', userProfile);
      
      // Redirect new users to profile completion
      console.log('Redirecting new user to profile completion...');
      setTimeout(() => {
        window.location.href = '/complete-profile';
      }, 500);
      
    } else {
      console.log('Loading existing user profile...');
      const profile = userDoc.data() as UserProfile;
      setUserProfile(profile);
      console.log('Existing user profile loaded:', profile);
      
      // Update last active
      await setDoc(doc(db, 'users', user.uid), { lastActive: new Date() }, { merge: true });
      
      // If profile is complete, redirect to appropriate dashboard
      if (profile.profileComplete && profile.role) {
        console.log('Profile is complete, redirecting to dashboard...');
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (profile.role === 'farmer') {
            window.location.href = '/farmer/dashboard';
          } else if (profile.role === 'dealer') {
            window.location.href = '/dealer/dashboard';
          } else if (profile.role === 'admin') {
            window.location.href = '/admin';
          }
        }, 500);
      } else {
        // Existing user but incomplete profile
        console.log('Existing user with incomplete profile, redirecting to profile completion...');
        setTimeout(() => {
          window.location.href = '/complete-profile';
        }, 500);
      }
    }
    
    console.log('Google auth result processing complete');
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      const updatedProfile = {
        ...userProfile,
        ...data,
        lastActive: new Date(),
        profileComplete: true // Mark profile as complete when updated
      };

      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile as UserProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        
        // Update last active timestamp
        await setDoc(doc(db, 'users', uid), { lastActive: new Date() }, { merge: true });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Auth state changed:', user?.email || 'No user');
      setCurrentUser(user);
      
      if (user) {
        console.log('📝 Loading user profile for:', user.uid);
        await loadUserProfile(user.uid);
      } else {
        console.log('❌ No user, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Handle Google redirect result
    const handleRedirectResult = async () => {
      try {
        console.log('Checking for Google redirect result...');
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Google redirect successful:', result.user.email);
          await handleGoogleAuthResult(result.user);
        } else {
          console.log('No redirect result found');
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Set error state if needed
        if (error.code === 'auth/unauthorized-domain') {
          console.error('Domain not authorized in Firebase Console');
          alert('Domain not authorized. Please check Firebase Console settings.');
        } else if (error.code === 'auth/operation-not-allowed') {
          console.error('Google Sign-in not enabled in Firebase Console');
          alert('Google Sign-in not enabled. Please check Firebase Console.');
        } else {
          console.error('Unknown Google auth error:', error);
          alert(`Google Sign-in error: ${error.message}`);
        }
      }
    };

    handleRedirectResult();

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
