import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * LinkComponent - A hydration-safe wrapper component for Next.js Link with instant navigation
 * 
 * This component provides instant navigation without page refreshes,
 * just like in normal React SPAs. It wraps Next.js Link for optimal performance
 * and includes safeguards against hydration issues from heavy components like PrimeReact DataTable.
 */
const LinkComponent = ({ 
  href, 
  children, 
  className = '', 
  target = '_self',
  rel = '',
  onClick,
  style,
  replace = false, // Use replace instead of push for navigation
  scroll = true,   // Enable smooth scrolling to top
  shallow = false, // Enable shallow routing for dynamic routes
  prefetch = true, // Prefetch pages for faster navigation
  forceRefresh = false, // Force page refresh instead of client-side navigation
  ...props 
}) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [navigationFailures, setNavigationFailures] = useState(0);
  
  // Track hydration state to prevent hydration mismatches
  useEffect(() => {
    setIsHydrated(true);
    // Reset navigation failures when component mounts/remounts
    setNavigationFailures(0);
  }, []);
  
  // Reset navigation failures when route changes successfully
  useEffect(() => {
    const handleRouteChange = () => {
      setNavigationFailures(0);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  // Ensure href is always provided
  if (!href) {
    console.warn('LinkComponent: href prop is required');
    return null;
  }

  // Handle external links (they will refresh, but internal links won't)
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
  
  // Enhanced click handler with better hydration safety
  const handleClick = async (e) => {
    // Always prevent default behavior to stop form submissions or button actions
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LinkComponent clicked!', { 
      href, 
      isHydrated, 
      navigationFailures,
      routerReady: router.isReady 
    });
    
    // If there's a custom onClick, call it first
    if (onClick) {
      try {
        onClick(e);
      } catch (error) {
        console.warn('Custom onClick handler failed:', error);
      }
    }
    
    // For external links, handle manually
    if (isExternal) {
      if (target === '_blank') {
        window.open(href, '_blank', rel ? `rel=${rel}` : '');
      } else {
        window.location.href = href;
      }
      return;
    }
    
    // Force refresh if explicitly requested
    if (forceRefresh) {
      console.log('Force refresh requested for:', href);
      window.location.href = href;
      return;
    }
    
    // Only fall back to hard navigation if we've had multiple consecutive failures
    // AND we're having hydration issues
    if (navigationFailures >= 3 && !isHydrated) {
      console.warn('LinkComponent: Multiple navigation failures with hydration issues, falling back to hard navigation');
      window.location.href = href;
      return;
    }
    
    // Try Next.js router navigation with improved error handling
    try {
      const currentPath = router.asPath;
      console.log('Attempting client-side navigation from', currentPath, 'to', href);
      
      // Don't increment failures here - only on actual failure
      
      // Check if router is ready (but don't fail if it's not - just wait a bit)
      if (!router.isReady) {
        console.log('Router not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If still not ready after wait, try anyway
        if (!router.isReady) {
          console.log('Router still not ready, attempting navigation anyway...');
        }
      }
      
      // Perform navigation with shorter timeout for better UX
      const navigationPromise = replace ? router.replace(href) : router.push(href);
      
      // Set a reasonable timeout for navigation (reduced from 3000ms to 1500ms)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Navigation timeout')), 1500)
      );
      
      await Promise.race([navigationPromise, timeoutPromise]);
      
      // Reset failures on successful navigation
      setNavigationFailures(0);
      console.log('Client-side navigation successful to:', href);
      
    } catch (error) {
      console.warn('Client-side navigation failed:', error.message);
      
      // Increment failure count
      const newFailureCount = navigationFailures + 1;
      setNavigationFailures(newFailureCount);
      
      // Only fall back to hard navigation if we've had many failures
      // OR if this is a critical navigation error
      const isCriticalError = error.message.includes('timeout') || 
                             error.message.includes('aborted') ||
                             !isHydrated;
      
      if (newFailureCount >= 5 || (newFailureCount >= 2 && isCriticalError)) {
        console.log('Falling back to hard navigation after', newFailureCount, 'failures');
        window.location.href = href;
      } else {
        console.log('Navigation failed, but will retry on next attempt. Failures:', newFailureCount);
        // For non-critical failures, we don't fallback - let user try again
      }
    }
  };

  // Enhanced key handler with same safety measures
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  };

  // For internal links, we'll handle click manually to prevent button/form issues
  if (!isExternal) {
    return (
      <div 
        onClick={handleClick}
        className={className}
        style={{ 
          cursor: 'pointer', 
          textDecoration: 'none',
          display: 'inline-block',
          ...style 
        }}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        // Add data attributes for debugging
        data-href={href}
        data-hydrated={isHydrated}
        data-navigation-failures={navigationFailures}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  // For external links, use regular anchor tag
  return (
    <a 
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </a>
  );
};

export default LinkComponent; 