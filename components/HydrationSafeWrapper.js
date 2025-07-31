import React, { useState, useEffect } from 'react';

/**
 * HydrationSafeWrapper - A wrapper component that prevents hydration mismatches
 * 
 * This component ensures that heavy components like PrimeDataTable are only
 * rendered after hydration is complete, preventing conflicts with navigation.
 */
const HydrationSafeWrapper = ({ 
  children, 
  fallback = <div>Loading...</div>,
  className = '',
  style = {},
  ...props 
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after component mounts
    setIsHydrated(true);
  }, []);

  // Show fallback during SSR and initial hydration
  if (!isHydrated) {
    return (
      <div className={className} style={style} {...props}>
        {fallback}
      </div>
    );
  }

  // Render children only after hydration
  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
};

export default HydrationSafeWrapper; 