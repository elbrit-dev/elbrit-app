import React from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import RavenAutoLogin to avoid SSR issues
const RavenAutoLogin = dynamic(() => import('../components/RavenAutoLogin'), { 
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
      <p>Loading Raven Auto Login Component...</p>
    </div>
  )
});

export default function TestRavenAutoLogin() {
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
        <p>Please log in first to test Raven auto-login integration.</p>
        <p>Go to <a href="/test-auth">/test-auth</a> to log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🪶 Raven Auto-Login Integration Test</h1>
      
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
        <h2>🪶 Enhanced Raven Auto-Login</h2>
        <p>This component uses multiple authentication methods to automatically log you into Raven:</p>
        <ul>
          <li>✅ <strong>ERPNext API Authentication</strong> - Uses your existing token</li>
          <li>✅ <strong>Raven Session Creation</strong> - Creates proper session</li>
          <li>✅ <strong>Enhanced URL Parameters</strong> - Passes all auth data</li>
          <li>✅ <strong>Fallback Mechanisms</strong> - Multiple retry approaches</li>
        </ul>
        
        <RavenAutoLogin 
          height="600px"
          width="100%"
          showLoading={true}
          mode="iframe"
          onLoad={() => console.log('✅ Raven Auto-Login loaded successfully!')}
          onError={() => console.log('❌ Raven Auto-Login failed to load')}
          style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>How Enhanced Auto-Login Works</h2>
        <ol>
          <li><strong>ERPNext Authentication:</strong> Validates your token with ERPNext API</li>
          <li><strong>Raven Session Creation:</strong> Attempts to create a proper Raven session</li>
          <li><strong>Enhanced URL Building:</strong> Constructs URL with all authentication data</li>
          <li><strong>Auto-Login Parameters:</strong> Adds special flags for automatic login</li>
          <li><strong>Fallback Handling:</strong> If one method fails, tries alternative approaches</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>If you see Raven chat interface already logged in:</strong> Auto-login works perfectly!</li>
          <li>⚠️ <strong>If you see Raven login page:</strong> Auto-login needs server configuration</li>
          <li>❌ <strong>If you see error message:</strong> Check browser console for details</li>
          <li>🔄 <strong>Loading steps:</strong> Initializing → Authenticating → Ready</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>If Auto-Login Still Doesn't Work</h2>
        <p>The component will show an "Open in New Window" button as a fallback. This ensures users can always access Raven even if iframe embedding is blocked.</p>
        <p><strong>Next step:</strong> Contact your server administrator to fix the X-Frame-Options header on erp.elbrit.org</p>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>This enhanced component provides the best auto-login experience possible!</strong></p>
        <p>Use "Raven Auto Login" component in Plasmic Studio for optimal results.</p>
      </div>
    </div>
  );
}
