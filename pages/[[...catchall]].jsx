import * as React from "react";
import {
  PlasmicComponent,
  extractPlasmicQueryData,
  PlasmicRootProvider,
  DataProvider,
} from "@plasmicapp/loader-nextjs";

import Error from "next/error";
import { useRouter } from "next/router";
import { PLASMIC } from "../plasmic-init";
import { useAuth } from '../components/AuthContext';
import { useEffect, useState, useMemo, useRef } from 'react';
import PlasmicDataContext from '../components/PlasmicDataContext';
import PlasmicErrorBoundary from '../components/PlasmicErrorBoundary';

export default function PlasmicLoaderPage(props) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();
  
  // Get Firebase user from AuthContext
  const { user: firebaseUser, loading: firebaseLoading } = useAuth();

  // HYDRATION FIX: Add hydration tracking - MUST BE CALLED FIRST
  const isHydratedRef = useRef(false);
  
  // HOOKS FIX: All useState hooks must be called in the same order every time
  const [plasmicUser, setPlasmicUser] = useState(null);
  const [plasmicAuthToken, setPlasmicAuthToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isStable, setIsStable] = useState(false); // HYDRATION FIX: Additional stability check
  
  // HOOKS FIX: All useMemo hooks must be called in the same order every time
  const pageMeta = useMemo(() => {
    return plasmicData?.entryCompMetas?.[0] || null;
  }, [plasmicData]);

  const userContext = useMemo(() => ({
    email: firebaseUser?.email,
    uid: firebaseUser?.uid,
    isAuthenticated: !!firebaseUser,
    displayName: firebaseUser?.displayName,
    photoURL: firebaseUser?.photoURL,
    groupIds: firebaseUser?.groupIds || [],
    roles: firebaseUser?.roles || [],
    // Add roleName and roleNames for Plasmic access control
    roleName: plasmicUser?.roleName,
    roleNames: plasmicUser?.roleNames,
  }), [firebaseUser, plasmicUser]);

  const userEmail = useMemo(() => firebaseUser?.email || "", [firebaseUser?.email]);
  
  // HOOKS FIX: All useEffect hooks must be called in the same order every time
  // HYDRATION FIX: Track hydration completion
  useEffect(() => {
    isHydratedRef.current = true;
  }, []);
  
  // HYDRATION FIX: Load Plasmic auth data from localStorage with hydration safety
  useEffect(() => {
    if (!isHydratedRef.current) return;
    
    // Defer to next tick to avoid setState during render
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('plasmicUser');
        const storedToken = localStorage.getItem('plasmicAuthToken');
        
        if (storedUser) {
          try {
            setPlasmicUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('plasmicUser');
          }
        }
        if (storedToken) setPlasmicAuthToken(storedToken);
        setAuthLoaded(true);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // HYDRATION FIX: Fallback auth refresh with hydration safety
  useEffect(() => {
    if (!isHydratedRef.current) return;
    
    async function refreshPlasmicAuth() {
      if (
        typeof window !== 'undefined' &&
        firebaseUser &&
        (!plasmicUser || !plasmicAuthToken)
      ) {
        console.log('Refreshing Plasmic auth for Firebase user:', firebaseUser.email);
        try {
          const response = await fetch('/api/auth/plasmic-custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email,
              groupIds: firebaseUser.groupIds || []
            })
          });
          if (response.ok) {
            const plasmicData = await response.json();
            console.log('Plasmic auth refresh successful:', plasmicData);
            setPlasmicUser(plasmicData.user);
            setPlasmicAuthToken(plasmicData.token);
            localStorage.setItem('plasmicUser', JSON.stringify(plasmicData.user));
            localStorage.setItem('plasmicAuthToken', plasmicData.token);
          } else {
            console.error('Plasmic auth refresh failed:', response.status, response.statusText);
          }
        } catch (err) {
          console.error('Failed to refresh Plasmic Auth:', err);
        }
      }
    }
    
    // HYDRATION FIX: Defer execution to avoid setState during render
    const timer = setTimeout(refreshPlasmicAuth, 0);
    return () => clearTimeout(timer);
  }, [firebaseUser, plasmicUser, plasmicAuthToken]);

  // HYDRATION FIX: Stability check - ensure everything is settled before rendering Plasmic
  useEffect(() => {
    if (authLoaded && isHydratedRef.current) {
      const stabilityTimer = setTimeout(() => {
        setIsStable(true);
      }, 100); // Small delay to ensure everything is stable
      
      return () => clearTimeout(stabilityTimer);
    }
  }, [authLoaded]);

  // HYDRATION FIX: Debug logging moved to useEffect to avoid render-time execution
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
      console.log("🔍 Plasmic user:", plasmicUser);
      console.log("🔍 Plasmic token:", plasmicAuthToken);
      console.log("🔍 User context:", userContext);
      console.log("🔍 Auth loaded:", authLoaded);
      console.log("🔍 Is stable:", isStable);
    }
  }, [plasmicUser, plasmicAuthToken, userContext, authLoaded, isStable]);

  // HOOKS FIX: All hooks called - now we can do conditional returns
  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    console.log("❌ No Plasmic data found, returning 404");
    return <Error statusCode={404} />;
  }
  
  // HYDRATION FIX: Show loading state until auth is loaded and stable
  if (!authLoaded || !isStable) {
    console.log("⏳ Auth not loaded or not stable, showing loading...");
    return <div>Loading...</div>;
  }

  console.log("✅ Rendering Plasmic component:", pageMeta?.displayName);

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      userAuthToken={plasmicAuthToken}
      user={plasmicUser}
      key={`plasmic-root-${pageMeta?.displayName || 'unknown'}-${authLoaded}`} // HYDRATION FIX: Force remount on auth changes
    >
      {/* HYDRATION FIX: Wrap in error boundary and stability check */}
      {authLoaded && isStable && pageMeta && (
        <>
          {/* Make user data available for Plasmic Studio data queries */}
          <DataProvider 
            name="currentUser" 
            data={userContext}
            key={`user-context-${firebaseUser?.uid || 'anonymous'}`} // HYDRATION FIX: Stable key
          >
            {/* Make email available as a global variable for Plasmic Studio */}
            <DataProvider 
              name="userEmail" 
              data={userEmail}
              key={`user-email-${userEmail}`} // HYDRATION FIX: Stable key
            >
              {/* Set up global variables for Plasmic Studio GraphQL queries */}
              <PlasmicDataContext />
              {/* HYDRATION FIX: Wrap in error boundary to catch setState during render errors */}
              <PlasmicErrorBoundary>
                <PlasmicComponent 
                  component={pageMeta.displayName}
                  key={`component-${pageMeta.displayName}-${userContext.isAuthenticated}`} // HYDRATION FIX: Stable component key
                />
              </PlasmicErrorBoundary>
            </DataProvider>
          </DataProvider>
        </>
      )}
    </PlasmicRootProvider>
  );
}

export const getServerSideProps = async (context) => {
  const { catchall } = context.params ?? {};
  const plasmicPath = typeof catchall === 'string' ? catchall : Array.isArray(catchall) ? `/${catchall.join('/')}` : '/';
  const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath);
  if (!plasmicData) {
    // non-Plasmic catch-all
    return { props: {} };
  }
  const pageMeta = plasmicData.entryCompMetas[0];

  // Cache the necessary data fetched for the page
  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      pageRoute={pageMeta.path}
      pageParams={pageMeta.params}
    >
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );

  return { 
    props: { 
      plasmicData, 
      queryCache
    } 
  };
}
