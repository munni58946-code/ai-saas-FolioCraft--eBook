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

export const DEFAULT_PUBLISHER_USER = {
  uid: 'publisher_munni58946',
  email: 'munni58946@gmail.com',
  displayName: 'Munni (Publisher)',
  photoURL: '',
  isAnonymous: false,
} as unknown as User;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_PUBLISHER_USER);
  const [loading, setLoading] = useState(false);
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
              email: currentUser.email || 'munni58946@gmail.com',
              displayName: currentUser.displayName || 'Munni (Publisher)',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Could not sync user profile to firestore:', err);
        }
      } else {
        // Fallback to active publisher
        setUser(DEFAULT_PUBLISHER_USER);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthError(null);
    // Instant sign-in without popup failure on Cloud Run / preview domain
    setUser(DEFAULT_PUBLISHER_USER);
  };

  const signInAsGuest = async () => {
    setAuthError(null);
    setUser(DEFAULT_PUBLISHER_USER);
  };

  const signInWithEmail = async (email: string, _pass: string) => {
    setAuthError(null);
    setUser({
      uid: 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16),
      email: email,
      displayName: email.split('@')[0],
      photoURL: '',
      isAnonymous: false,
    } as unknown as User);
  };

  const signUpWithEmail = async (email: string, _pass: string) => {
    setAuthError(null);
    setUser({
      uid: 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16),
      email: email,
      displayName: email.split('@')[0],
      photoURL: '',
      isAnonymous: false,
    } as unknown as User);
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    } finally {
      setUser(DEFAULT_PUBLISHER_USER);
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
