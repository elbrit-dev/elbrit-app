import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

/**
 * This component helps with GraphQL queries in Plasmic Studio
 * by providing the user's authentication context to the query.
 */
export default function PlasmicGraphQLHelper({ 
  children, 
  query, 
  variables = {}, 
  endpoint,
  loadingComponent,
  errorComponent
}) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Execute the GraphQL query with the user's authentication context
  useEffect(() => {
    if (!query || !endpoint) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add the user's authentication context to the variables
        const enrichedVariables = {
          ...variables,
          email: user?.email || variables.email,
          uid: user?.uid || variables.uid,
          isAuthenticated: !!user
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if user is authenticated
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {})
          },
          body: JSON.stringify({
            query,
            variables: enrichedVariables
          })
        });

        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        setData(result.data);
        setLoading(false);
      } catch (err) {
        console.error('GraphQL query error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [query, endpoint, user?.email, user?.uid, user?.token, JSON.stringify(variables)]);

  if (loading && loadingComponent) {
    return loadingComponent;
  }

  if (error && errorComponent) {
    return React.cloneElement(errorComponent, { error });
  }

  // Render children with the GraphQL data
  if (typeof children === 'function') {
    return children({ data, loading, error });
  }

  // Clone the child elements and pass the data as props
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { data, loading, error });
    }
    return child;
  });
} 