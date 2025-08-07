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
        const storedToken = localStorage.getItem('plasmicAuthToken');
        const storedUser = localStorage.getItem('plasmicUser');
        const storedPhoneNumber = localStorage.getItem('userPhoneNumber'); // Load phone number
        const storedAuthProvider = localStorage.getItem('authProvider'); // Load auth provider
        
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
        
        // Set auth provider if available
        if (storedAuthProvider) {
          setAuthProvider(storedAuthProvider);
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        // Clear invalid data
        localStorage.removeItem('plasmicAuthToken');
        localStorage.removeItem('plasmicUser');
        localStorage.removeItem('userPhoneNumber');
        localStorage.removeItem('authProvider');
      }
    }
  };

  // Function to handle phone login data processing
  const processPhoneLoginData = async (firebaseUser) => {
    try {
      // Get employee data from localStorage
      const employeeDataStr = localStorage.getItem('employeeData');
      if (!employeeDataStr) {
        console.log('❌ No employee data found in localStorage for phone login');
        return null;
      }

      const employeeData = JSON.parse(employeeDataStr);
      console.log('📱 Processing phone login data:', employeeData);

      // Extract email from employee data
      const email = employeeData.employeeData?.company_email || employeeData.employeeData?.user_id__name;
      
      if (!email) {
        console.log('❌ No email found in employee data');
        return null;
      }

      console.log('📧 Email from employee data:', email);

      // Create user data without role assignment (role will come from Plasmic custom auth)
      const userData = {
        email: email,
        displayName: employeeData.employeeData?.first_name || email.split('@')[0],
        phoneNumber: employeeData.phoneNumber,
        employeeData: employeeData.employeeData,
        authProvider: 'phone',
        customProperties: {
          organization: "Elbrit Life Sciences", // Default organization
          accessLevel: "full", // Default access level
          provider: 'phone',
          employeeId: employeeData.employeeData?.employee_number,
          department: employeeData.employeeData?.department__name,
          designation: employeeData.employeeData?.designation__name,
          dateOfJoining: employeeData.employeeData?.date_of_joining,
          dateOfBirth: employeeData.employeeData?.date_of_birth
        }
      };

      console.log('👤 Created user data for phone login:', userData);

      // Store in localStorage like Microsoft login
      if (typeof window !== 'undefined') {
        localStorage.setItem('phoneUserData', JSON.stringify(userData));
        console.log('💾 Phone user data stored in localStorage');
      }

      return userData;
    } catch (error) {
      console.error('❌ Error processing phone login data:', error);
      return null;
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
            // Create or fetch user document in Firestore (for logging/profile only)
            console.log('📝 Fetching/creating user in Firestore...');
            await fetchOrCreateUser(user);

            // Handle phone login data processing
            let phoneUserData = null;
            if (provider === 'phone') {
              phoneUserData = await processPhoneLoginData(user);
            }

            // Always fetch Plasmic user and token for roles/permissions
            console.log('🔑 Fetching Plasmic user data...');
            
            // Use email from phone user data if available, otherwise use Firebase user email
            const emailForPlasmic = phoneUserData?.email || user.email;
            
            const response = await fetch('/api/auth/plasmic-custom', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: emailForPlasmic,
                phoneNumber: user.phoneNumber // Include original phone number in request
              })
            });
            
            if (response.ok) {
              const plasmicData = await response.json();
              const plasmicUser = plasmicData.user;
              const plasmicToken = plasmicData.token;
              
              console.log('✅ Plasmic user data received:', plasmicUser.email || plasmicUser.phoneNumber);
              
              // Merge phone user data with Plasmic user data if available
              let finalUser = plasmicUser;
              if (phoneUserData) {
                finalUser = {
                  ...plasmicUser,
                  ...phoneUserData,
                  role: phoneUserData.role || plasmicUser.role,
                  customProperties: {
                    ...plasmicUser.customProperties,
                    ...phoneUserData.customProperties
                  }
                };
              }
              
              setUser(finalUser);
              setToken(plasmicToken);
              setIsAuthenticated(true);
              
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('plasmicAuthToken', plasmicToken);
                  localStorage.setItem('plasmicUser', JSON.stringify(finalUser));
                  console.log('💾 Auth data saved to localStorage');
                } catch (storageError) {
                  console.warn('Failed to save auth data to localStorage:', storageError);
                }
              }
              
              // Update Firestore user role if needed
              if (user.uid && finalUser.role) {
                try {
                  console.log('🔄 Updating user role in Firestore...');
                  await updateFirestoreUserRoleIfNeeded(user.uid, finalUser.role);
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
          setAuthProvider(null); // Clear auth provider on logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('plasmicAuthToken');
            localStorage.removeItem('plasmicUser');
            localStorage.removeItem('userPhoneNumber'); // Remove phone number from storage
            localStorage.removeItem('authProvider'); // Remove auth provider from storage
            localStorage.removeItem('employeeData'); // Remove employee data
            localStorage.removeItem('phoneUserData'); // Remove phone user data
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
    setAuthProvider(null); // Clear auth provider on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('plasmicAuthToken');
      localStorage.removeItem('plasmicUser');
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