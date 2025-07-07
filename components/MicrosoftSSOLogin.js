import React, { useEffect, useRef, useState } from "react";
import app from "../firebase";
import { getAuth, OAuthProvider } from "firebase/auth";
import dynamic from 'next/dynamic';

// Mapping of group IDs to group names and roles
const groupIdToInfo = {
  [process.env.AZURE_IT_GROUP_ID]: { name: "IT", role: "Editor" },
  // Add more group mappings here if needed
};

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
          signInSuccessWithAuthResult: async (authResult, redirectUrl) => {
            const user = authResult.user;
            const idToken = await user.getIdToken();

            console.log('Auth result:', authResult);
            console.log('User:', user);

            // Get Microsoft access token
            const credential = OAuthProvider.credentialFromResult(authResult);
            console.log('OAuth credential:', credential);
            
            // Check if credential exists and has accessToken
            if (!credential || !credential.accessToken) {
              console.error('No access token available from OAuth credential');
              console.log('Auth result structure:', JSON.stringify(authResult, null, 2));
              
              // Continue without group information if no access token
              const enrichedUser = {
                ...user,
                groupIds: [],
                groupInfo: [],
                roles: []
              };

              // Still try to get Plasmic token without group info
              let plasmicToken = null;
              let plasmicUser = null;
              try {
                const plasmicResponse = await fetch('/api/auth/plasmic-custom', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: user.email,
                    groupIds: []
                  })
                });
                
                if (plasmicResponse.ok) {
                  const plasmicData = await plasmicResponse.json();
                  plasmicToken = plasmicData.token;
                  plasmicUser = {
                    ...plasmicData.user,
                    groupIds: [],
                    groupInfo: [],
                    roles: []
                  };
                  console.log('Plasmic Auth successful:', plasmicData);
                  
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('plasmicAuthToken', plasmicToken);
                    localStorage.setItem('plasmicUser', JSON.stringify(plasmicUser));
                  }
                }
              } catch (plasmicError) {
                console.error('Failed to get Plasmic Auth token:', plasmicError);
              }

              // Update the user in AuthContext
              if (typeof window !== 'undefined' && window.authContext && window.authContext.login) {
                window.authContext.login(user, idToken, []);
              }
              
              if (onSuccess) onSuccess({ 
                firebaseUser: enrichedUser, 
                groupIds: [], 
                groupInfo: [], 
                plasmicToken, 
                plasmicUser 
              });

              return false;
            }
            
            const accessToken = credential.accessToken;

            // Fetch group IDs from Microsoft Graph
            let groupIds = [];
            try {
              const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              const data = await response.json();
              console.log('Fetched group data from Microsoft Graph:', data);
              if (data.value) {
                groupIds = data.value.map(group => group.id);
              }
              console.log('Extracted groupIds:', groupIds);
            } catch (groupError) {
              // If fetching groups fails, continue without group info
              console.error('Failed to fetch group IDs:', groupError);
            }

            // Map group IDs to group names and roles
            const groupInfo = groupIds.map(id => groupIdToInfo[id] || { name: id, role: 'Unknown' });

            // Add group information to the user object for use in Plasmic integrations
            const enrichedUserWithGroupInfo = {
              ...user,
              groupIds,
              groupInfo,
              roles: groupInfo.map(g => g.role).filter(r => r !== 'Unknown')
            };

            // Exchange for Plasmic Auth token using our API route
            let plasmicTokenWithGroupInfo = null;
            let plasmicUserWithGroupInfo = null;
            try {
              const plasmicResponse = await fetch('/api/auth/plasmic-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  groupIds: groupIds
                })
              });
              
              if (plasmicResponse.ok) {
                const plasmicData = await plasmicResponse.json();
                plasmicTokenWithGroupInfo = plasmicData.token;
                plasmicUserWithGroupInfo = {
                  ...plasmicData.user,
                  groupIds,
                  groupInfo,
                  roles: groupInfo.map(g => g.role).filter(r => r !== 'Unknown')
                };
                console.log('Plasmic Auth successful:', plasmicData);
                
                // Store the token and enriched user in localStorage for use across the app
                if (typeof window !== 'undefined') {
                  localStorage.setItem('plasmicAuthToken', plasmicTokenWithGroupInfo);
                  localStorage.setItem('plasmicUser', JSON.stringify(plasmicUserWithGroupInfo));
                }
              } else {
                const errorData = await plasmicResponse.json();
                console.error('Plasmic Auth failed:', errorData);
              }
            } catch (plasmicError) {
              console.error('Failed to get Plasmic Auth token:', plasmicError);
            }

            // Update the user in AuthContext with group information
            if (typeof window !== 'undefined' && window.authContext && window.authContext.login) {
              window.authContext.login(user, idToken, groupInfo);
            }
            
            if (onSuccess) onSuccess({ 
              firebaseUser: enrichedUserWithGroupInfo, 
              groupIds, 
              groupInfo, 
              plasmicToken: plasmicTokenWithGroupInfo, 
              plasmicUser: plasmicUserWithGroupInfo 
            });

            // Return false to prevent automatic redirect
            return false;
          },
          signInFailure: (error) => {
            console.error('Sign-in failed:', error);
            if (onError) onError(error);
            return Promise.resolve();
          },
          uiShown: () => {
            console.log('FirebaseUI is shown');
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