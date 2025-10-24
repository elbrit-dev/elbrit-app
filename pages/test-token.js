import React from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import TokenChecker to avoid SSR issues
const TokenChecker = dynamic(() => import('../components/TokenChecker'), { 
  ssr: false, 
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <p>Loading Token Checker...</p>
    </div>
  )
});

export default function TestToken() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading Authentication...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>❌ Not Authenticated</h1>
        <p>Please log in first to see token details.</p>
        <p>Go to <a href="/test-auth">/test-auth</a> to log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔑 Token Analysis & Debugging</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>User:</strong> {user?.email || user?.phoneNumber}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Token Details</h2>
        <TokenChecker showDetails={true} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Compact Token Status</h2>
        <TokenChecker compact={true} />
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>How Token is Created</h2>
        <p>The authentication token is created in <code>pages/api/erpnext/auth.js</code>:</p>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`// Line 194 in pages/api/erpnext/auth.js
const token = Buffer.from(\`\${userData.uid}:\${Date.now()}\`).toString('base64');

// What this creates:
// - userData.uid: User's unique ID from ERPNext
// - Date.now(): Current timestamp
// - Encoded in base64 format`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Token Usage for Raven</h2>
        <p>The token is used in two ways:</p>
        <ol>
          <li><strong>URL Parameters:</strong> Passed to Raven via URL query string</li>
          <li><strong>API Endpoint:</strong> Used by <code>/api/raven/auth</code> for server-side authentication</li>
        </ol>
        <p><strong>Example Raven URL:</strong></p>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`https://erp.elbrit.org?token=YOUR_BASE64_TOKEN&email=user@email.com&provider=microsoft&_t=timestamp`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>Token Validation</h2>
        <p>The token is validated by:</p>
        <ul>
          <li><strong>Format Check:</strong> Must be valid base64</li>
          <li><strong>Structure Check:</strong> Must contain uid:timestamp format</li>
          <li><strong>Expiration Check:</strong> Must be less than 24 hours old</li>
          <li><strong>User Verification:</strong> User must exist in ERPNext Employee table</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h2>Next Steps</h2>
        <p>Now that you can see the token details:</p>
        <ol>
          <li>✅ <strong>Verify token is valid</strong> - Check if it's expired or not</li>
          <li>🧪 <strong>Test Raven integration</strong> - Go to <a href="/test-raven">/test-raven</a> or <a href="/test-raven-simple">/test-raven-simple</a></li>
          <li>🔍 <strong>Check browser console</strong> - Look for authentication logs</li>
          <li>📱 <strong>Use in Plasmic</strong> - Add "Raven Chat Embed" or "Raven Chat Simple" to your pages</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a 
          href="/test-raven" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            margin: '0 10px'
          }}
        >
          🪶 Test Raven Original
        </a>
        <a 
          href="/test-raven-simple" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            margin: '0 10px'
          }}
        >
          🪶 Test Raven Simple
        </a>
      </div>
    </div>
  );
}
