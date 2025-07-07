import React from "react";
import app from "../firebase";
import { getAuth, signInWithPopup, OAuthProvider } from "firebase/auth";

// Mapping of group IDs to group names and roles
const groupIdToInfo = {
  [process.env.AZURE_IT_GROUP_ID]: { name: "IT", role: "Editor" },
  // Add more group mappings here if needed
};

export default function MicrosoftSSOLogin({ onSuccess, onError }) {
  const handleLogin = async () => {
    const auth = getAuth(app);
    const provider = new OAuthProvider('microsoft.com');
    // Set the tenant to restrict sign-in to your organization only
    provider.setCustomParameters({
      tenant: process.env.NEXT_PUBLIC_AZURE_TENANT_ID // <-- Replace with your Azure Directory (tenant) ID
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Get Microsoft access token
      const credential = OAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      // Fetch group IDs from Microsoft Graph
      let groupIds = [];
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MICROSOFT_GRAPH_ENDPOINT}/me/memberOf`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();
        if (data.value) {
          groupIds = data.value.map(group => group.id);
        }
      } catch (groupError) {
        // If fetching groups fails, continue without group info
        console.error('Failed to fetch group IDs:', groupError);
      }

      // Map group IDs to group names and roles
      const groupInfo = groupIds.map(id => groupIdToInfo[id] || { name: id, role: 'Unknown' });

      // Add group information to the user object for use in Plasmic integrations
      const enrichedUser = {
        ...user,
        groupIds,
        groupInfo,
        roles: groupInfo.map(g => g.role).filter(r => r !== 'Unknown')
      };

      // Exchange for Plasmic Auth token using our API route
      let plasmicToken = null;
      let plasmicUser = null;
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
          plasmicToken = plasmicData.token;
          plasmicUser = {
            ...plasmicData.user,
            groupIds,
            groupInfo,
            roles: groupInfo.map(g => g.role).filter(r => r !== 'Unknown')
          };
          console.log('Plasmic Auth successful:', plasmicData);
          
          // Store the token and enriched user in localStorage for use across the app
          if (typeof window !== 'undefined') {
            localStorage.setItem('plasmicAuthToken', plasmicToken);
            localStorage.setItem('plasmicUser', JSON.stringify(plasmicUser));
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
        firebaseUser: enrichedUser, 
        groupIds, 
        groupInfo, 
        plasmicToken, 
        plasmicUser 
      });
    } catch (error) {
      if (onError) onError(error);
    }
  };

  return (
    <button onClick={handleLogin} style={{ padding: '10px 20px', background: '#2F2F2F', color: '#fff', border: 'none', borderRadius: 4 }}>
      Sign in with Microsoft
    </button>
  );
} 