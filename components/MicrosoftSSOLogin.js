import React, { useEffect, useRef, useState } from "react";
import app from "../firebase";
import { getAuth } from "firebase/auth";
import dynamic from 'next/dynamic';

// Dynamically import FirebaseUI to avoid SSR issues
const FirebaseUIComponent = ({ onSuccess, onError }) => {
  const uiRef = useRef(null);
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeFirebaseUI = async () => {
      const auth = getAuth(app);
      
      // Dynamically import FirebaseUI only on client side
      const firebaseui = await import('firebaseui');
      await import('firebaseui/dist/firebaseui.css');
      
      // Initialize FirebaseUI
      uiRef.current = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

      // Configure FirebaseUI
      const uiConfig = {
        signInOptions: [
          {
            provider: 'microsoft.com',
            customParameters: {
              tenant: process.env.NEXT_PUBLIC_AZURE_TENANT_ID
            }
          }
        ],
        signInFlow: 'popup',
        callbacks: {
          signInSuccessWithAuthResult: (authResult, redirectUrl) => {
            console.log('Microsoft SSO login successful:', authResult.user.email);
            
            // The AuthContext will automatically handle Firestore user creation
            // and state management when Firebase Auth state changes
            if (onSuccess) onSuccess({ firebaseUser: authResult.user });
            
            return false; // Don't redirect, let the app handle it
          },
          signInFailure: (error) => {
            console.error('Microsoft SSO login failed:', error);
            if (onError) onError(error);
            return Promise.resolve();
          },
          uiShown: () => {
            console.log('FirebaseUI is ready');
          }
        }
      };

      // Start FirebaseUI
      uiRef.current.start(containerRef.current, uiConfig);

      // Cleanup function
      return () => {
        if (uiRef.current) {
          uiRef.current.reset();
        }
      };
    };

    initializeFirebaseUI();
  }, [isClient, onSuccess, onError]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div ref={containerRef}></div>
    </div>
  );
};

// Export the component with dynamic import to prevent SSR
export default dynamic(() => Promise.resolve(FirebaseUIComponent), {
  ssr: false,
  loading: () => <div>Loading authentication...</div>
}); 