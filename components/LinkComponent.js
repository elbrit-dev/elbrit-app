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
    <div className={`link-component ${className}`} style={style}>
      <Link 
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        {...props}
      >
        {/* Slot for children content */}
        <div className="link-slot">
          {children}
        </div>
      </Link>
    </div>
  );
};

export default LinkComponent; 