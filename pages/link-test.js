import React from 'react';
import LinkComponent from '../components/LinkComponent';

const LinkTestPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>LinkComponent Test Page</h1>
      <p>This page tests the LinkComponent for page navigation.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Page Navigation Examples</h3>
        <div style={{ marginBottom: '10px' }}>
          <LinkComponent href="/">
            Home Page
          </LinkComponent>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <LinkComponent 
            href="/dashboard" 
            style={{ color: '#8b5cf6', textDecoration: 'underline' }}
          >
            Dashboard
          </LinkComponent>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <LinkComponent href="/link-test">
            Current Page (Link Test)
          </LinkComponent>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>External Links</h3>
        <div style={{ marginBottom: '10px' }}>
          <LinkComponent 
            href="https://example.com" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'blue' }}
          >
            External Website
          </LinkComponent>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Navigation Menu</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <LinkComponent href="/">Home</LinkComponent>
          <LinkComponent href="/about">About</LinkComponent>
          <LinkComponent href="/contact">Contact</LinkComponent>
          <LinkComponent href="/services">Services</LinkComponent>
          <LinkComponent href="/blog">Blog</LinkComponent>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>How to Use in Plasmic</h3>
        <p>1. In Plasmic Studio, drag the "Link Component" from the component library</p>
        <p>2. Set the "href" prop to your page URL (e.g., "/dashboard", "/about")</p>
        <p>3. Add your content in the children slot</p>
        <p>4. Style it using the "style" prop or "className" prop</p>
      </div>
    </div>
  );
};

export default LinkTestPage; 