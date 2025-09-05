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
import { useEffect, useState, useMemo, useRef, useCallback, Suspense } from 'react';
import PlasmicDataContext from '../components/PlasmicDataContext';
import PlasmicErrorBoundary from '../components/PlasmicErrorBoundary';

// PERFORMANCE FIX: PPR disabled - requires Next.js canary version
// export const experimental_ppr = true;

// PERFORMANCE FIX: Add loading skeleton for PPR
function PlasmicSkeleton() {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      borderRadius: '8px',
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>Loading...</div>
    </div>
  );
}

export default function PlasmicLoaderPage(props) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();
  
  // Get Firebase user from AuthContext
  const { user: firebaseUser, loading: firebaseLoading } = useAuth();

  // PERFORMANCE FIX: Simplified state management
  const [plasmicUser, setPlasmicUser] = useState(null);
  const [plasmicAuthToken, setPlasmicAuthToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  
  // PERFORMANCE FIX: Simplified memoization
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
    roleName: plasmicUser?.roleName,
    roleNames: plasmicUser?.roleNames,
  }), [firebaseUser, plasmicUser]);

  const userEmail = useMemo(() => firebaseUser?.email || "", [firebaseUser?.email]);
  
  // PERFORMANCE FIX: Simplified auth loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('erpnextUser');
      const storedToken = localStorage.getItem('erpnextAuthToken');
      
      if (storedUser) {
        try {
          setPlasmicUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('erpnextUser');
        }
      }
      if (storedToken) setPlasmicAuthToken(storedToken);
      setAuthLoaded(true);
    }
  }, []);

  // PERFORMANCE FIX: Simplified auth refresh
  useEffect(() => {
    async function refreshERPNextAuth() {
      if (
        typeof window !== 'undefined' &&
        firebaseUser &&
        (!plasmicUser || !plasmicAuthToken)
      ) {
        try {
          const response = await fetch('/api/erpnext/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              authProvider: firebaseUser.phoneNumber ? 'phone' : 'microsoft'
            })
          });
          if (response.ok) {
            const erpnextData = await response.json();
            setPlasmicUser(erpnextData.user);
            setPlasmicAuthToken(erpnextData.token);
            localStorage.setItem('erpnextUser', JSON.stringify(erpnextData.user));
            localStorage.setItem('erpnextAuthToken', erpnextData.token);
          }
        } catch (err) {
          console.error('Failed to refresh ERPNext Auth:', err);
        }
      }
    }
    
    if (firebaseUser) {
      refreshERPNextAuth();
    }
  }, [firebaseUser, plasmicUser, plasmicAuthToken]);

  // PERFORMANCE FIX: Simplified retry handler
  const handleRetry = useCallback(() => {
    setRenderKey(prev => prev + 1);
  }, []);

  // Early returns for better performance
  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    return <Error statusCode={404} />;
  }
  
  // PERFORMANCE FIX: Simplified loading state
  if (!authLoaded) {
    return <PlasmicSkeleton />;
  }

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      key={`plasmic-root-${pageMeta?.displayName || 'unknown'}-${renderKey}`}
    >
      {pageMeta && (
        <>
          <DataProvider 
            name="currentUser" 
            data={userContext}
            key={`user-context-${firebaseUser?.uid || 'anonymous'}-${renderKey}`}
          >
            <DataProvider 
              name="userEmail" 
              data={userEmail}
              key={`user-email-${userEmail}-${renderKey}`}
            >
              <PlasmicDataContext />
              {/* PERFORMANCE FIX: Wrap in Suspense for PPR */}
              <Suspense fallback={<PlasmicSkeleton />}>
                <PlasmicErrorBoundary onRetry={handleRetry}>
                  <PlasmicComponent 
                    component={pageMeta.displayName}
                    key={`component-${pageMeta.displayName}-${userContext.isAuthenticated}-${renderKey}`}
                  />
                </PlasmicErrorBoundary>
              </Suspense>
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
  
  try {
    // PERFORMANCE FIX: Only fetch essential component data
    const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath);
    if (!plasmicData) {
      return { props: {} };
    }

    // PERFORMANCE FIX: Reduce payload size by only including essential data
    // This prevents the "Large Page Data" warning (>= 128kB)
    const optimizedPlasmicData = {
      entryCompMetas: plasmicData.entryCompMetas,
      bundle: plasmicData.bundle,
      // Remove heavy data that can be loaded client-side
      // queryCache: null, // Load client-side instead
      // globalVariants: null, // Load client-side instead
    };

    return { 
      props: { 
        plasmicData: optimizedPlasmicData,
        // Remove queryCache to reduce payload size
        queryCache: null
      } 
    };
  } catch (error) {
    console.error('Plasmic SSR error:', error);
    return { 
      props: { 
        plasmicData: null,
        queryCache: null
      } 
    };
  }
}