import React from 'react';
import LinkComponent from '../components/LinkComponent';

const LinkTestPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>LinkComponent Test Page</h1>
      <p>This page tests the LinkComponent without any authentication requirements.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Basic Link</h3>
        <LinkComponent href="/">
          Home Page
        </LinkComponent>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Nested Link</h3>
        <LinkComponent href="/dashboard" className="nested">
          Dashboard
        </LinkComponent>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Active Link</h3>
        <LinkComponent href="/link-test" className="active">
          Current Page
        </LinkComponent>
      </div>

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

      <div style={{ marginBottom: '20px' }}>
        <h3>Link with Click Handler</h3>
        <LinkComponent 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            alert('Link clicked successfully!');
          }}
        >
          Click Me
        </LinkComponent>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Link with Custom Style</h3>
        <LinkComponent 
          href="/profile" 
          style={{ color: '#8b5cf6', fontWeight: 'bold' }}
        >
          Profile Page
        </LinkComponent>
      </div>
    </div>
  );
};

export default LinkTestPage; 