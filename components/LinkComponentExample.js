import React from 'react';
import LinkComponent from './LinkComponent';

/**
 * Example usage of the LinkComponent
 * Demonstrates how to use the component with different types of children content
 */
const LinkComponentExample = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Link Component Examples</h2>
      
      {/* Simple text link */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Text Link:</h3>
        <LinkComponent href="/about" className="text-link">
          About Us
        </LinkComponent>
      </div>

      {/* Link with icon and text */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Link with Icon:</h3>
        <LinkComponent href="/dashboard" className="icon-link">
          <span style={{ marginRight: '8px' }}>📊</span>
          Dashboard
        </LinkComponent>
      </div>

      {/* External link */}
      <div style={{ marginBottom: '20px' }}>
        <h3>External Link:</h3>
        <LinkComponent 
          href="https://example.com" 
          target="_blank"
          className="external-link"
        >
          Visit External Site
        </LinkComponent>
      </div>

      {/* Link with custom styling */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Styled Link:</h3>
        <LinkComponent 
          href="/contact" 
          className="styled-link"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            margin: '5px'
          }}
        >
          Contact Us
        </LinkComponent>
      </div>

      {/* Link with onClick handler */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Link with Click Handler:</h3>
        <LinkComponent 
          href="/api/test" 
          onClick={(e) => {
            e.preventDefault();
            alert('Link clicked!');
          }}
          className="clickable-link"
        >
          Click Me (with alert)
        </LinkComponent>
      </div>
    </div>
  );
};

export default LinkComponentExample; 