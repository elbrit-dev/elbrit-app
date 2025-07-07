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
import { useEffect, useState } from 'react';
import PlasmicDataContext from '../components/PlasmicDataContext';

export default function PlasmicLoaderPage(props) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();
  
  // Get Firebase user from AuthContext
  const { user: firebaseUser, loading: firebaseLoading } = useAuth();

  // State for Plasmic authentication data
  const [plasmicUser, setPlasmicUser] = useState(null);
  const [plasmicAuthToken, setPlasmicAuthToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  
  // Load Plasmic auth data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('plasmicUser');
      const storedToken = localStorage.getItem('plasmicAuthToken');
      
      if (storedUser) setPlasmicUser(JSON.parse(storedUser));
      if (storedToken) setPlasmicAuthToken(storedToken);
      setAuthLoaded(true);
    }
  }, []);

  if (!plasmicData || plasmicData.entryCompMetas.length === 0 || !authLoaded) {
    return <Error statusCode={404} />;
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  // Create data context with user information for Plasmic integrations
  // This will be available in Plasmic Studio for data queries
  const userContext = {
    email: firebaseUser?.email,
    uid: firebaseUser?.uid,
    isAuthenticated: !!firebaseUser,
    displayName: firebaseUser?.displayName,
    photoURL: firebaseUser?.photoURL,
    groupIds: firebaseUser?.groupIds || [],
    roles: firebaseUser?.roles || []
  };

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      userAuthToken={plasmicAuthToken}
      user={plasmicUser}
    >
      {/* Make user data available for Plasmic Studio data queries */}
      <DataProvider name="currentUser" data={userContext}>
        {/* Make email available as a global variable for Plasmic Studio */}
        <DataProvider name="userEmail" data={firebaseUser?.email || ""}>
          {/* Set up global variables for Plasmic Studio GraphQL queries */}
          <PlasmicDataContext />
          <PlasmicComponent component={pageMeta.displayName} />
        </DataProvider>
      </DataProvider>
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
