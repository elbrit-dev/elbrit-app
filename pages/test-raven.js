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
      <p>Loading Raven Chat Component...</p>
    </div>
  )
});

export default function TestRaven() {
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
        <p>Please log in first to test Raven integration.</p>
        <p>Go to <a href="/test-auth">/test-auth</a> to log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🪶 Raven Chat Integration Test</h1>
      
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
        <h2>🪶 Raven Chat Embed</h2>
        <p>Below is the embedded Raven chat application with auto-login:</p>
        <p><strong>Raven URL:</strong> https://uat.elbrit.org/raven</p>
        
        <RavenEmbed 
          height="600px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven loaded successfully!')}
          onError={() => console.log('❌ Raven failed to load')}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>Instructions</h2>
        <ol>
          <li><strong>Auto-Login:</strong> You should be automatically logged into Raven using your stored credentials</li>
          <li><strong>Test Chat:</strong> Try sending a message or creating a channel</li>
          <li><strong>Check Console:</strong> Open browser console to see authentication logs</li>
          <li><strong>Mobile Test:</strong> Test on mobile devices to ensure responsiveness</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Troubleshooting</h2>
        <ul>
          <li><strong>Not Loading:</strong> Check if Raven URL is accessible</li>
          <li><strong>Login Issues:</strong> Verify ERPNext token is valid and not expired</li>
          <li><strong>CORS Errors:</strong> Ensure Raven allows iframe embedding</li>
          <li><strong>Token Issues:</strong> Check browser console for authentication errors</li>
        </ul>
      </div>
    </div>
  );
}
