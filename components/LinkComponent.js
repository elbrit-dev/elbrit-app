import React from 'react';
import Link from 'next/link';

/**
 * LinkComponent - A wrapper component for Next.js Link with slot for children
 * 
 * This component provides a consistent interface for navigation links
 * with a slot pattern for children content.
 * No authentication required - pure navigation component.
 */
const LinkComponent = ({ 
  href, 
  children, 
  className = '', 
  target = '_self',
  rel = '',
  onClick,
  style,
  ...props 
}) => {
  // Ensure href is always provided
  if (!href) {
    console.warn('LinkComponent: href prop is required');
    return null;
  }

  return (
    <Link 
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkComponent; 