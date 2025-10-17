import React from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import RavenEmbed to avoid SSR issues
const RavenEmbed = dynamic(() => import('../components/RavenEmbed'), { 
  ssr: false, 
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <p>Loading Enhanced Raven Embed Component...</p>
    </div>
  )
});

export default function TestRavenEnhanced() {
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
        <p>Please log in first to test enhanced Raven integration.</p>
        <p>Go to <a href="/test-auth">/test-auth</a> to log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🪶 Enhanced Raven Chat Embed Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>User:</strong> {user?.email || user?.phoneNumber}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Display Name:</strong> {user?.displayName}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>LocalStorage Data</h2>
        <p><strong>ERPNext Token:</strong> {typeof window !== 'undefined' ? localStorage.getItem('erpnextAuthToken') ? '✅ Available' : '❌ Missing' : 'N/A'}</p>
        <p><strong>User Email:</strong> {typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'Not stored' : 'N/A'}</p>
        <p><strong>Auth Provider:</strong> {typeof window !== 'undefined' ? localStorage.getItem('authProvider') || 'Not stored' : 'N/A'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Enhanced Raven Chat Embed</h2>
        <p>This is the updated RavenEmbed component with enhanced auto-login functionality:</p>
        <ul>
          <li>✅ <strong>Multiple Authentication Methods</strong> - ERPNext API + Raven API + Enhanced URL</li>
          <li>✅ <strong>Better Auto-Login</strong> - More likely to work automatically</li>
          <li>✅ <strong>Step-by-Step Loading</strong> - Shows authentication progress</li>
          <li>✅ <strong>Enhanced Error Handling</strong> - Better fallback mechanisms</li>
        </ul>
        
        <RavenEmbed 
          height="600px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Enhanced Raven Embed loaded successfully!')}
          onError={() => console.log('❌ Enhanced Raven Embed failed to load')}
          style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>Enhanced Authentication Process</h2>
        <ol>
          <li><strong>Initializing:</strong> Component loads and checks authentication</li>
          <li><strong>ERPNext API:</strong> Validates token with ERPNext API</li>
          <li><strong>Raven API:</strong> Attempts to create Raven session</li>
          <li><strong>Enhanced URL:</strong> Builds URL with all authentication data</li>
          <li><strong>Auto-Login:</strong> Passes special flags for automatic login</li>
          <li><strong>Ready:</strong> Raven loads with user already logged in</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>If you see Raven chat interface already logged in:</strong> Enhanced auto-login works perfectly!</li>
          <li>⚠️ <strong>If you see Raven login page:</strong> Auto-login needs server configuration</li>
          <li>❌ <strong>If you see iframe error:</strong> X-Frame-Options still blocking (use Raven Launcher instead)</li>
          <li>🔄 <strong>Loading steps:</strong> Initializing → Authenticating → Ready</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>If iframe is Still Blocked</h2>
        <p>If you still see the X-Frame-Options error, use these alternatives:</p>
        <ul>
          <li>🪶 <strong>Raven Chat Launcher</strong> - Opens in new window (works always)</li>
          <li>🪶 <strong>Raven Chat Modal</strong> - Opens in modal popup</li>
          <li>🪶 <strong>Raven Auto Login</strong> - Enhanced version with fallbacks</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>The RavenEmbed component is now enhanced with better auto-login!</strong></p>
        <p>Use "Raven Chat Embed" in Plasmic Studio for the updated functionality.</p>
      </div>
    </div>
  );
}
