import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../firebase';

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
  const [authProvider, setAuthProvider] = useState(null); // Add auth provider state
  
  // Add refs to prevent race conditions
  const authStateRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Function to clean phone number by removing country code
  const cleanPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    
    // Remove +91 country code if present
    let cleanedNumber = phoneNumber.replace(/^\+91/, '');
    
    // Remove any remaining + or spaces
    cleanedNumber = cleanedNumber.replace(/^\+/, '').replace(/\s/g, '');
    
    // If the number starts with 91 and is longer than 10 digits, remove the 91
    if (cleanedNumber.startsWith('91') && cleanedNumber.length > 10) {
      cleanedNumber = cleanedNumber.substring(2);
    }
    
    return cleanedNumber;
  };

  // Function to determine auth provider
  const getAuthProvider = (firebaseUser) => {
    if (!firebaseUser) return null;
    
    // Check if it's phone authentication
    if (firebaseUser.phoneNumber) {
      return 'phone';
    }
    
    // Check provider data for Microsoft
    const providerData = firebaseUser.providerData;
    if (providerData && providerData.length > 0) {
      const provider = providerData[0];
      if (provider.providerId === 'microsoft.com') {
        return 'microsoft';
      }
    }
    
    // Default to email if no specific provider found
    return 'email';
  };

  // Function to load auth state from localStorage
  const loadAuthFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('erpnextAuthToken');
        const storedUser = localStorage.getItem('erpnextUser');
        const storedPhoneNumber = localStorage.getItem('userPhoneNumber');
        const storedAuthProvider = localStorage.getItem('authProvider');
        const storedAuthType = localStorage.getItem('authType');
        const storedAuthMethod = localStorage.getItem('authMethod');
        
        if (storedToken && storedUser && storedAuthType === 'erpnext') {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(!!parsedUser);
          
          console.log('📱 Loaded auth from localStorage:', {
            authType: storedAuthType,
            authProvider: storedAuthProvider,
            authMethod: storedAuthMethod,
            userEmail: parsedUser.email,
            userRole: parsedUser.role
          });
        }
        
        // Set phone number if available
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
        
        // Set auth provider if available
        if (storedAuthProvider) {
          setAuthProvider(storedAuthProvider);
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        // Clear invalid data
        localStorage.removeItem('erpnextAuthToken');
        localStorage.removeItem('erpnextUser');
        localStorage.removeItem('userPhoneNumber');
        localStorage.removeItem('authProvider');
        localStorage.removeItem('authType');
        localStorage.removeItem('authMethod');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userDisplayName');
        localStorage.removeItem('userRole');
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
          
          // Determine auth provider
          const provider = getAuthProvider(user);
          setAuthProvider(provider);
          console.log('🔐 Authentication provider:', provider);
          
          // Store phone number if available (without country code)
          if (user.phoneNumber) {
            const cleanedPhoneNumber = cleanPhoneNumber(user.phoneNumber);
            setPhoneNumber(cleanedPhoneNumber);
            if (typeof window !== 'undefined') {
              localStorage.setItem('userPhoneNumber', cleanedPhoneNumber);
              localStorage.setItem('authProvider', provider);
              console.log('📱 Phone number saved to localStorage (cleaned):', cleanedPhoneNumber);
              console.log('📱 Original phone number:', user.phoneNumber);
              console.log('🔐 Auth provider saved:', provider);
            }
          } else if (provider === 'microsoft') {
            // Store Microsoft provider info
            if (typeof window !== 'undefined') {
              localStorage.setItem('authProvider', provider);
              console.log('🔐 Microsoft auth provider saved:', provider);
            }
          }
          
          try {
            // Always fetch ERPNext user and token for roles/permissions
            console.log('🔑 Fetching ERPNext user data...');
            
            // For Microsoft SSO: use Firebase email directly
            // For Phone Auth: ERPNext API will get company_email from Employee data
            const emailForERPNext = user.email; // Always pass Firebase email (will be used for Microsoft SSO)
            
            const response = await fetch('/api/erpnext/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: emailForERPNext,
                phoneNumber: user.phoneNumber, // Include original phone number in request
                authProvider: provider // Pass the auth provider
              })
            });
            
            if (response.ok) {
              const erpnextData = await response.json();
              const erpnextUser = erpnextData.user;
              const erpnextToken = erpnextData.token;
              
              console.log('✅ ERPNext user data received:', erpnextUser.email || erpnextUser.phoneNumber);
              console.log('📊 User source:', erpnextData.userSource);
              console.log('🔑 ERPNext user role:', erpnextUser.role);
              console.log('🔑 ERPNext user data:', erpnextUser);
              
              // Use ERPNext user data directly (no merging needed)
              const finalUser = erpnextUser;
              
              console.log('🎯 Final user data being set:', finalUser);
              setUser(finalUser);
              setToken(erpnextToken);
              setIsAuthenticated(true);
              
              if (typeof window !== 'undefined') {
                try {
                  // Store ERPNext auth data
                  localStorage.setItem('erpnextAuthToken', erpnextToken);
                  localStorage.setItem('erpnextUser', JSON.stringify(finalUser));
                  
                  // Store authentication type and provider info
                  localStorage.setItem('authType', 'erpnext');
                  localStorage.setItem('authProvider', provider);
                  localStorage.setItem('authMethod', provider === 'phone' ? 'phone' : 'microsoft');
                  
                  // Store user details for easy access
                  localStorage.setItem('userEmail', finalUser.email);
                  localStorage.setItem('userDisplayName', finalUser.displayName);
                  localStorage.setItem('userRole', finalUser.role);
                  localStorage.setItem('userPhoneNumber', finalUser.phoneNumber || '');
                  
                  console.log('💾 Auth data saved to localStorage:', {
                    authType: 'erpnext',
                    authProvider: provider,
                    authMethod: provider === 'phone' ? 'phone' : 'microsoft',
                    userEmail: finalUser.email,
                    userRole: finalUser.role
                  });
                } catch (storageError) {
                  console.warn('Failed to save auth data to localStorage:', storageError);
                }
              }
              
              // No longer updating Firestore - using ERPNext as single source of truth
              
              console.log('✅ Auth state updated successfully');
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('Failed to fetch ERPNext user data:', response.status, errorData);
              
              // Handle access denied error
              if (response.status === 403) {
                console.error('❌ Access denied - user not in organization:', errorData.message);
                alert('Access Denied: You are not authorized to access this system. Please contact your administrator.');
              }
              
              // Clear user data
              setUser(null);
              setToken(null);
              setIsAuthenticated(false);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('erpnextAuthToken');
                localStorage.removeItem('erpnextUser');
              }
            }
                  } catch (error) {
          console.error('Error during auth state change:', error);
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          if (typeof window !== 'undefined') {
            // Clear all auth data on error
            localStorage.removeItem('erpnextAuthToken');
            localStorage.removeItem('erpnextUser');
            localStorage.removeItem('authType');
            localStorage.removeItem('authProvider');
            localStorage.removeItem('authMethod');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userDisplayName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userPhoneNumber');
          }
        }
        } else {
          console.log('Firebase user signed out');
          // User signed out
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setPhoneNumber(null); // Clear phone number on logout
          setAuthProvider(null); // Clear auth provider on logout
          if (typeof window !== 'undefined') {
            // Clear all ERPNext auth data
            localStorage.removeItem('erpnextAuthToken');
            localStorage.removeItem('erpnextUser');
            localStorage.removeItem('userPhoneNumber');
            localStorage.removeItem('authProvider');
            localStorage.removeItem('authType');
            localStorage.removeItem('authMethod');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userDisplayName');
            localStorage.removeItem('userRole');
            
            // Clear old data
            localStorage.removeItem('employeeData');
            localStorage.removeItem('phoneUserData');
            
            console.log('🧹 Cleared all auth data from localStorage');
          }
        }
      } catch (error) {
        console.error('Critical error in auth state change:', error);
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setPhoneNumber(null);
        setAuthProvider(null);
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

  const login = (erpnextUser, erpnextToken) => {
    setUser(erpnextUser);
    setToken(erpnextToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('erpnextAuthToken', erpnextToken);
      localStorage.setItem('erpnextUser', JSON.stringify(erpnextUser));
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
    setAuthProvider(null); // Clear auth provider on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('erpnextAuthToken');
      localStorage.removeItem('erpnextUser');
      localStorage.removeItem('userPhoneNumber'); // Remove phone number from storage
      localStorage.removeItem('authProvider'); // Remove auth provider from storage
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
    phoneNumber, // Expose phone number
    authProvider // Expose auth provider
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