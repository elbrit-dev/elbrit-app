import React, { useEffect, useRef } from "react";
import app from "../firebase";
import { getAuth, OAuthProvider } from "firebase/auth";

// Mapping of group IDs to group names and roles
const groupIdToInfo = {
  [process.env.AZURE_IT_GROUP_ID]: { name: "IT", role: "Editor" },
  // Add more group mappings here if needed
};

const uiConfig = {
  signInOptions: [
    {
      provider: OAuthProvider.PROVIDER_ID,
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

      // Get Microsoft access token
      const credential = OAuthProvider.credentialFromResult(authResult);
      const accessToken = credential.accessToken;

      // Fetch group IDs from Microsoft Graph
      let groupIds = [];
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
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
      
      // No redirect
      return false;
    },
    signInFailure: (error) => {
      console.error('Sign in failed:', error);
    }
  }
};

export default function MicrosoftSSOLogin() {
  const uiRef = useRef(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      (typeof window !== "undefined" && window.__PLASMIC_PREVIEW__)
    ) {
      return;
    }

    let ui = null;
    let cleanup = null;

    Promise.all([
      import("firebaseui"),
      import("firebaseui/dist/firebaseui.css")
    ]).then(([firebaseui]) => {
      const auth = getAuth(app);
      ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
      ui.start("#firebaseui-auth-container", uiConfig);
      cleanup = () => {
        if (ui) {
          ui.reset();
        }
      };
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // SSR/Plasmic Studio guard with styled preview
  if (
    typeof window === "undefined" ||
    (typeof window !== "undefined" && window.__PLASMIC_PREVIEW__)
  ) {
    return (
      <div className="firebaseui-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 80 }}>
        <button
          className="firebaseui-idp-button"
          disabled
          style={{
            opacity: 0.7,
            fontSize: 16,
            padding: "12px 32px",
            background: "#2F2F2F",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "not-allowed"
          }}
        >
          <span className="firebaseui-idp-text">
            Microsoft Login (Preview)
          </span>
        </button>
      </div>
    );
  }

  return <div id="firebaseui-auth-container" ref={uiRef} />;
} 