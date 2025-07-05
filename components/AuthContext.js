import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth state from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('plasmicAuthToken');
      const storedUser = localStorage.getItem('plasmicUser');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('plasmicAuthToken');
          localStorage.removeItem('plasmicUser');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken, groupInfo = null) => {
    // Enrich user data with group information if available
    const enrichedUserData = groupInfo ? {
      ...userData,
      groupInfo,
      roles: groupInfo.map(g => g.role).filter(r => r !== 'Unknown')
    } : userData;
    
    setUser(enrichedUserData);
    setToken(authToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('plasmicAuthToken', authToken);
      localStorage.setItem('plasmicUser', JSON.stringify(enrichedUserData));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('plasmicAuthToken');
      localStorage.removeItem('plasmicUser');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token
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