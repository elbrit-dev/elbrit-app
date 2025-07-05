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
  const { user } = useAuth();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set global variables for Plasmic Studio to use in GraphQL queries
      window.PLASMIC_DATA = {
        // User information
        user: {
          email: user?.email || '',
          uid: user?.uid || '',
          displayName: user?.displayName || '',
          isAuthenticated: !!user
        },
        
        // Group and role information
        userGroups: user?.groupIds || [],
        userRoles: user?.roles || []
      };
      
      // Dispatch an event to notify Plasmic Studio that data is ready
      const event = new CustomEvent('plasmic-data-ready', { 
        detail: { user: window.PLASMIC_DATA.user } 
      });
      window.dispatchEvent(event);
    }
  }, [user]);
  
  // This component doesn't render anything visible
  return null;
} 