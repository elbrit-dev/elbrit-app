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
  const [navigationAttempts, setNavigationAttempts] = useState(0);
  
  // Track hydration state to prevent hydration mismatches
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Ensure href is always provided
  if (!href) {
    console.warn('LinkComponent: href prop is required');
    return null;
  }

  // Handle external links (they will refresh, but internal links won't)
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
  
  // Enhanced click handler with hydration safety and fallback mechanisms
  const handleClick = async (e) => {
    // Always prevent default behavior to stop form submissions or button actions
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LinkComponent clicked!', { href, target: e.target, isHydrated, navigationAttempts });
    
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
      window.location.href = href;
      return;
    }
    
    // Check if we're not hydrated yet or have navigation issues
    if (!isHydrated || navigationAttempts >= 2) {
      console.warn('LinkComponent: Hydration issues detected or multiple navigation failures, falling back to hard navigation');
      window.location.href = href;
      return;
    }
    
    // Try Next.js router navigation with error handling
    try {
      const currentPath = router.asPath;
      console.log('Attempting navigation from', currentPath, 'to', href);
      
      // Increment navigation attempts
      setNavigationAttempts(prev => prev + 1);
      
      // Add a small delay to ensure any ongoing renders complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check if router is ready
      if (!router.isReady) {
        console.warn('Router not ready, falling back to hard navigation');
        window.location.href = href;
        return;
      }
      
      // Perform navigation
      const navigationPromise = replace ? router.replace(href) : router.push(href);
      
      // Set a timeout for navigation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Navigation timeout')), 3000)
      );
      
      await Promise.race([navigationPromise, timeoutPromise]);
      
      // Reset attempts on successful navigation
      setTimeout(() => setNavigationAttempts(0), 1000);
      
      console.log('Navigation successful to:', href);
      
    } catch (error) {
      console.error('Next.js router navigation failed:', error);
      console.log('Falling back to hard navigation');
      
      // Fallback to hard navigation
      window.location.href = href;
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
        data-navigation-attempts={navigationAttempts}
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