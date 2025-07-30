import React from 'react';
import Link from 'next/link';

/**
 * Custom Link Component that wraps Next.js Link with a slot for children
 * This component provides a consistent interface for navigation links
 * with support for children content through a slot pattern
 */
const LinkComponent = ({ 
  href, 
  children, 
  className = '', 
  target = '_self',
  rel = '',
  onClick,
  ...props 
}) => {
  // Handle external links (starting with http/https)
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
  
  // Handle internal links
  if (!isExternal) {
    return (
      <Link 
        href={href} 
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  // Handle external links
  return (
    <a 
      href={href}
      className={className}
      target={target}
      rel={rel || (target === '_blank' ? 'noopener noreferrer' : '')}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  );
};

export default LinkComponent; 