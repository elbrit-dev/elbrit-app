import React from 'react';
import LinkComponent from './LinkComponent';
import '../styles/LinkComponent.css';

/**
 * Example usage of LinkComponent
 * Demonstrates different ways to use the component with children slots
 */
const LinkComponentExample = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>LinkComponent Examples</h2>
      
      {/* Basic usage */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Basic Link</h3>
        <LinkComponent href="/dashboard">
          Dashboard
        </LinkComponent>
      </div>

      {/* With custom styling */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Styled Link</h3>
        <LinkComponent 
          href="/profile" 
          className="nested"
          style={{ color: '#8b5cf6' }}
        >
          User Profile
        </LinkComponent>
      </div>

      {/* With icon and text */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Link with Icon</h3>
        <LinkComponent href="/settings">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#8b5cf6', 
              borderRadius: '50%',
              display: 'inline-block'
            }}></span>
            Settings
          </span>
        </LinkComponent>
      </div>

      {/* External link */}
      <div style={{ marginBottom: '20px' }}>
        <h3>External Link</h3>
        <LinkComponent 
          href="https://example.com" 
          target="_blank"
          rel="noopener noreferrer"
        >
          External Website
        </LinkComponent>
      </div>

      {/* With onClick handler */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Link with Click Handler</h3>
        <LinkComponent 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            alert('Link clicked!');
          }}
        >
          Click Me
        </LinkComponent>
      </div>

      {/* Active state example */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Active Link</h3>
        <LinkComponent 
          href="/current-page" 
          className="active"
        >
          Current Page
        </LinkComponent>
      </div>
    </div>
  );
};

export default LinkComponentExample; 