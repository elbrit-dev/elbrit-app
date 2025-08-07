import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null); // Add phone number state
  
  // Add refs to prevent race conditions
  const authStateRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Function to load auth state from localStorage
  const loadAuthFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('plasmicAuthToken');
        const storedUser = localStorage.getItem('plasmicUser');
        const storedPhoneNumber = localStorage.getItem('userPhoneNumber'); // Load phone number
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(!!parsedUser);
        }
        
        // Set phone number if available
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        // Clear invalid data
        localStorage.removeItem('plasmicAuthToken');
        localStorage.removeItem('plasmicUser');
        localStorage.removeItem('userPhoneNumber');
      }
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Prevent race conditions
      if (isProcessingRef.current) {
        console.log('Auth state change already processing, skipping...');
        return;
      }
      
      isProcessingRef.current = true;
      authStateRef.current = user;
      
      try {
        console.log('🔄 Auth state change triggered:', user?.email || user?.phoneNumber || 'no user');
        setFirebaseUser(user);
        
        if (user) {
          console.log('Firebase user authenticated:', user.email || user.phoneNumber);
          
          // Store phone number if available
          if (user.phoneNumber) {
            setPhoneNumber(user.phoneNumber);
            if (typeof window !== 'undefined') {
              localStorage.setItem('userPhoneNumber', user.phoneNumber);
              console.log('📱 Phone number saved to localStorage:', user.phoneNumber);
            }
          }
          
          try {
            // Create or fetch user document in Firestore (for logging/profile only)
            console.log('📝 Fetching/creating user in Firestore...');
            await fetchOrCreateUser(user);

            // Always fetch Plasmic user and token for roles/permissions
            console.log('🔑 Fetching Plasmic user data...');
            const response = await fetch('/api/auth/plasmic-custom', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: user.email,
                phoneNumber: user.phoneNumber // Include phone number in request
              })
            });
            
            if (response.ok) {
              const plasmicData = await response.json();
              const plasmicUser = plasmicData.user;
              const plasmicToken = plasmicData.token;
              
              console.log('✅ Plasmic user data received:', plasmicUser.email || plasmicUser.phoneNumber);
              
              setUser(plasmicUser);
              setToken(plasmicToken);
              setIsAuthenticated(true);
              
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('plasmicAuthToken', plasmicToken);
                  localStorage.setItem('plasmicUser', JSON.stringify(plasmicUser));
                  console.log('💾 Auth data saved to localStorage');
                } catch (storageError) {
                  console.warn('Failed to save auth data to localStorage:', storageError);
                }
              }
              
              // Update Firestore user role if needed
              if (user.uid && plasmicUser.role) {
                try {
                  console.log('🔄 Updating user role in Firestore...');
                  await updateFirestoreUserRoleIfNeeded(user.uid, plasmicUser.role);
                  console.log('✅ User role updated in Firestore');
                } catch (roleError) {
                  console.warn('Failed to update user role in Firestore:', roleError);
                }
              }
              
              console.log('✅ Auth state updated successfully');
            } else {
              console.error('Failed to fetch Plasmic user data:', response.status);
              // Fallback: clear user
              setUser(null);
              setToken(null);
              setIsAuthenticated(false);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('plasmicAuthToken');
                localStorage.removeItem('plasmicUser');
              }
            }
          } catch (error) {
            console.error('Error during auth state change:', error);
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('plasmicAuthToken');
              localStorage.removeItem('plasmicUser');
            }
          }
        } else {
          console.log('Firebase user signed out');
          // User signed out
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setPhoneNumber(null); // Clear phone number on logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('plasmicAuthToken');
            localStorage.removeItem('plasmicUser');
            localStorage.removeItem('userPhoneNumber'); // Remove phone number from storage
          }
        }
      } catch (error) {
        console.error('Critical error in auth state change:', error);
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setPhoneNumber(null);
      } finally {
        setLoading(false);
        isProcessingRef.current = false;
        console.log('🏁 Auth state change processing completed');
      }
    });

    // Load initial auth state from storage
    loadAuthFromStorage();

    return () => {
      unsubscribe();
      isProcessingRef.current = false;
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
    setPhoneNumber(null); // Clear phone number on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('plasmicAuthToken');
      localStorage.removeItem('plasmicUser');
      localStorage.removeItem('userPhoneNumber'); // Remove phone number from storage
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
    firebaseUser, // Expose Firebase user for components that need it
    phoneNumber // Expose phone number
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