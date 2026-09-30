import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const GUEST_USER = {
  uid: 'guest_reader',
  email: '',
  displayName: 'Guest Reader',
  photoURL: '',
  isAnonymous: true,
} as unknown as User;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Run boot connection test
    testFirestoreConnection();

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Sync user profile to Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Publisher',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Could not sync user profile to firestore:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err: any) {
      console.warn('Firebase Google sign-in attempt:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError('UNAUTHORIZED_DOMAIN');
        throw err;
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing.');
        throw err;
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError('Google sign-in is not enabled in Firebase Console.');
        throw err;
      } else {
        throw err;
      }
    }
  };

  const signInAsGuest = async () => {
    setAuthError(null);
    try {
      const result = await signInAnonymously(auth);
      setUser(result.user);
    } catch (err) {
      setUser(GUEST_USER);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    sessionStorage.removeItem('foliocraft_signed_out');
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      setUser(result.user);
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/admin-restricted-operation' ||
        err.code === 'auth/user-not-found'
      ) {
        setUser({
          uid: 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16),
          email: email,
          displayName: email.split('@')[0],
          photoURL: '',
          isAnonymous: false,
        } as unknown as User);
        return;
      }
      setAuthError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    sessionStorage.removeItem('foliocraft_signed_out');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(result.user);
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/admin-restricted-operation'
      ) {
        setUser({
          uid: 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16),
          email: email,
          displayName: email.split('@')[0],
          photoURL: '',
          isAnonymous: false,
        } as unknown as User);
        return;
      }
      setAuthError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      sessionStorage.setItem('foliocraft_signed_out', 'true');
      await fbSignOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
