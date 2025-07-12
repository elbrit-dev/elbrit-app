import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../firebase';
import { fetchOrCreateUser, updateFirestoreUserRoleIfNeeded } from '../utils/firestoreUser';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // This will be the Plasmic user
  const [token, setToken] = useState(null); // This will be the Plasmic token
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Function to load auth state from localStorage
  const loadAuthFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('plasmicAuthToken');
      const storedUser = localStorage.getItem('plasmicUser');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem('plasmicAuthToken');
          localStorage.removeItem('plasmicUser');
        }
      }
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Create or fetch user document in Firestore (for logging/profile only)
          await fetchOrCreateUser(user);

          // Always fetch Plasmic user and token for roles/permissions
          const response = await fetch('/api/auth/plasmic-custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
          if (response.ok) {
            const plasmicData = await response.json();
            const plasmicUser = plasmicData.user;
            const plasmicToken = plasmicData.token;
            setUser(plasmicUser);
            setToken(plasmicToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('plasmicAuthToken', plasmicToken);
              localStorage.setItem('plasmicUser', JSON.stringify(plasmicUser));
            }
            // Update Firestore user role if needed
            if (user.uid && plasmicUser.role) {
              await updateFirestoreUserRoleIfNeeded(user.uid, plasmicUser.role);
            }
          } else {
            // Fallback: clear user
            setUser(null);
            setToken(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('plasmicAuthToken');
              localStorage.removeItem('plasmicUser');
            }
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          setUser(null);
          setToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('plasmicAuthToken');
            localStorage.removeItem('plasmicUser');
          }
        }
      } else {
        // User signed out
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('plasmicAuthToken');
          localStorage.removeItem('plasmicUser');
        }
      }
      setLoading(false);
    });

    // Load initial state from localStorage
    loadAuthFromStorage();

    // Listen for storage changes (when localStorage is updated from other tabs/windows)
    const handleStorageChange = (event) => {
      if (event.key === 'plasmicAuthToken' || event.key === 'plasmicUser') {
        loadAuthFromStorage();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  const login = (plasmicUser, plasmicToken) => {
    setUser(plasmicUser);
    setToken(plasmicToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('plasmicAuthToken', plasmicToken);
      localStorage.setItem('plasmicUser', JSON.stringify(plasmicUser));
    }
  };

  const logout = async () => {
    const auth = getAuth(app);
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('plasmicAuthToken');
      localStorage.removeItem('plasmicUser');
    }
  };

  // Function to manually refresh auth state from localStorage
  const refreshAuth = () => {
    loadAuthFromStorage();
  };

  const value = {
    user, // Plasmic user
    token, // Plasmic token
    loading,
    login,
    logout,
    refreshAuth,
    isAuthenticated: !!user && !!token,
    firebaseUser // Expose Firebase user for components that need it
  };

  // Make auth context available globally for components that can't use hooks
  if (typeof window !== 'undefined') {
    window.authContext = value;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 