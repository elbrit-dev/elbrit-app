import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

/**
 * This component is responsible for exposing user data to Plasmic Studio
 * for use in GraphQL queries and other data operations.
 * 
 * It doesn't render anything visible but sets up global variables
 * that can be used in Plasmic Studio's data queries.
 */
// HYDRATION FIX: Memoize component to prevent unnecessary re-renders
const PlasmicDataContext = React.memo(function PlasmicDataContext() {
  const { user, loading, isAuthenticated } = useAuth();
  const isInitializedRef = useRef(false);
  const dataSetRef = useRef(false);
  
  useEffect(() => {
    // HYDRATION FIX: Additional safeguards to prevent setState during render
    if (loading || isInitializedRef.current) return;
    
    // HYDRATION FIX: Multiple delays to ensure complete stability
    const timer1 = setTimeout(() => {
      if (typeof window !== 'undefined' && !dataSetRef.current) {
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
        
        dataSetRef.current = true;
        
        // HYDRATION FIX: Dispatch event with even more delay
        const timer2 = setTimeout(() => {
          if (typeof window !== 'undefined' && window.PLASMIC_DATA) {
            try {
              const event = new CustomEvent('plasmic-data-ready', { 
                detail: { 
                  user: window.PLASMIC_DATA.user,
                  timestamp: new Date().toISOString()
                } 
              });
              window.dispatchEvent(event);
            } catch (error) {
              console.warn('Failed to dispatch plasmic-data-ready event:', error);
            }
          }
        }, 200); // Longer delay
        
        return () => clearTimeout(timer2);
      }
    }, 150); // Longer initial delay
    
    isInitializedRef.current = true;
    
    return () => {
      clearTimeout(timer1);
    };
  }, [user, isAuthenticated, loading]);
  
  // This component doesn't render anything visible
  return null;
});

export default PlasmicDataContext; 