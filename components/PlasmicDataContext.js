import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * This component is responsible for exposing user data to Plasmic Studio
 * for use in GraphQL queries and other data operations.
 * 
 * It doesn't render anything visible but sets up global variables
 * that can be used in Plasmic Studio's data queries.
 */
export default function PlasmicDataContext() {
  const { user, loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set global variables for Plasmic Studio to use in GraphQL queries
      window.PLASMIC_DATA = {
        // User information
        user: {
          email: user?.email || '',
          uid: user?.uid || '',
          displayName: user?.displayName || '',
          isAuthenticated: !!user,
          role: user?.role || '',
          roleName: user?.roleName || '',
          customProperties: user?.customProperties || {}
        },
        
        // Role information from Plasmic custom auth
        userRole: user?.role || '',
        userRoleName: user?.roleName || '',
        userCustomProperties: user?.customProperties || {}
      };
      
      // Dispatch an event to notify Plasmic Studio that data is ready
      const event = new CustomEvent('plasmic-data-ready', { 
        detail: { 
          user: window.PLASMIC_DATA.user,
          timestamp: new Date().toISOString()
        } 
      });
      window.dispatchEvent(event);
    }
  }, [user, isAuthenticated, loading]);
  
  // This component doesn't render anything visible
  return null;
} 