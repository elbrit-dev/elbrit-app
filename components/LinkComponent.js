import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * LinkComponent - A wrapper component for Next.js Link with instant navigation
 * 
 * This component provides instant navigation without page refreshes,
 * just like in normal React SPAs. It wraps Next.js Link for optimal performance.
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
  forceRefresh, // Plasmic-specific prop - filter out
  ...props 
}) => {
  const router = useRouter();
  
  // Handle invalid href values (common issue in Plasmic Studio)
  let validHref = href;
  
  if (typeof href === 'boolean') {
    console.warn('LinkComponent: href received boolean value, converting to default "/"');
    validHref = '/';
  } else if (typeof href === 'number') {
    console.warn('LinkComponent: href received number value, converting to string');
    validHref = String(href);
  } else if (!href || typeof href !== 'string') {
    console.warn('LinkComponent: href prop is required and must be a string, got:', typeof href, href);
    validHref = '/'; // Default fallback
  }
  
  // Ensure href is always provided and is a valid string
  if (!validHref || typeof validHref !== 'string') {
    console.error('LinkComponent: Unable to resolve valid href, rendering null');
    return null;
  }

  // Handle external links (they will refresh, but internal links won't)
  const isExternal = validHref.startsWith('http://') || validHref.startsWith('https://') || validHref.startsWith('mailto:') || validHref.startsWith('tel:');
  
  // Enhanced click handler to capture clicks from any child element (including buttons)
  const handleClick = (e) => {
    // Always prevent default behavior to stop form submissions or button actions
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LinkComponent clicked!', { href: validHref, target: e.target });
    
    // If there's a custom onClick, call it
    if (onClick) {
      onClick(e);
    }
    
    // For internal navigation, use Next.js router for instant navigation
    if (!isExternal) {
      console.log('Navigating to:', validHref);
      if (replace) {
        router.replace(validHref);
      } else {
        router.push(validHref);
      }
    } else {
      // For external links, open manually
      if (target === '_blank') {
        window.open(validHref, '_blank', rel ? `rel=${rel}` : '');
      } else {
        window.location.href = validHref;
      }
    }
  };

  // Filter out non-DOM props before spreading
  const { 
    replace: _replace, 
    scroll: _scroll, 
    shallow: _shallow, 
    prefetch: _prefetch,
    forceRefresh: _forceRefresh,
    ...domProps 
  } = props;

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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}
        {...domProps}
      >
        {children}
      </div>
    );
  }
  
  // For external links, use regular anchor tag
  return (
    <a 
      href={validHref}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={className}
      style={style}
      {...domProps}
    >
      {children}
    </a>
  );
};

export default LinkComponent; 