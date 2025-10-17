import React from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import RavenEmbedSimple to avoid SSR issues
const RavenEmbedSimple = dynamic(() => import('../components/RavenEmbedSimple'), { 
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
      <p>Loading Raven Chat Simple Component...</p>
    </div>
  )
});

export default function TestRavenSimple() {
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
      <h1>🪶 Raven Chat Simple Integration Test</h1>
      
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
        <h2>🪶 Raven Chat Simple Embed</h2>
        <p>Below is the simplified Raven chat application with improved authentication:</p>
        <p><strong>Raven URL:</strong> https://elbrit-ls.m.erpnext.com/raven</p>
        <p><strong>Approach:</strong> Session-based authentication with hidden iframe</p>
        
        <RavenEmbedSimple 
          height="600px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven Simple loaded successfully!')}
          onError={() => console.log('❌ Raven Simple failed to load')}
          style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>How This Version Works</h2>
        <ol>
          <li><strong>Hidden Authentication:</strong> Creates a hidden iframe to establish session</li>
          <li><strong>Session Sharing:</strong> Uses ERPNext session cookies if on same domain</li>
          <li><strong>Graceful Fallback:</strong> Falls back to login page if auth fails</li>
          <li><strong>Better Error Handling:</strong> Clear error messages and retry options</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>If you see Raven chat interface:</strong> Integration works perfectly!</li>
          <li>⚠️ <strong>If you see Raven login page:</strong> Session sharing didn't work, but you can login manually</li>
          <li>❌ <strong>If you see error message:</strong> Check browser console for details</li>
          <li>🔄 <strong>Loading steps:</strong> Initializing → Authenticating → Ready</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>Next Steps</h2>
        <p>If this works better than the original version:</p>
        <ul>
          <li>Use "Raven Chat Simple" component in Plasmic Studio instead of "Raven Chat Embed"</li>
          <li>This version has better error handling and authentication</li>
          <li>More reliable for production use</li>
        </ul>
      </div>
    </div>
  );
}
