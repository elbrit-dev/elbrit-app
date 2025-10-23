import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';
import { 
  getERPCookieData, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable,
  hasRavenAuthentication,
  getRavenAuthentication,
  setRavenAuthentication,
  buildRavenUrlWithCookieAuth
} from '../components/utils/erpCookieAuth';

// Dynamically import Raven components to avoid SSR issues
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
      <p>Loading Raven SSO Component...</p>
    </div>
  )
});

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
      <p>Loading Raven Embed SSO Component...</p>
    </div>
  )
});

export default function TestRavenSSO() {
  const { user, loading, isAuthenticated } = useAuth();
  const [cookieData, setCookieData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [cookieStatus, setCookieStatus] = useState('checking');
  const [ravenAuthStatus, setRavenAuthStatus] = useState('checking');
  const [ssoUrl, setSsoUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');

  // Check ERP cookie data and Raven authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkStatus = () => {
        const erpCookies = getERPCookieData();
        const isValid = validateERPCookieData(erpCookies);
        const userInfo = extractUserInfoFromCookies(erpCookies);
        const isAvailable = isERPCookieAuthAvailable();
        const hasRavenAuth = hasRavenAuthentication();
        const ravenAuthData = getRavenAuthentication();

        setCookieData(erpCookies);
        setUserInfo(userInfo);
        setCookieStatus(isAvailable ? 'available' : 'unavailable');
        setRavenAuthStatus(hasRavenAuth ? 'authenticated' : 'not_authenticated');

        // Build URLs
        if (isAvailable && erpCookies) {
          const ssoUrl = buildRavenUrlWithCookieAuth('https://erp.elbrit.org/raven', erpCookies, true);
          const directUrl = buildRavenUrlWithCookieAuth('https://erp.elbrit.org/raven', erpCookies, false);
          setSsoUrl(ssoUrl);
          setDirectUrl(directUrl);
        }
      };

      checkStatus();
      
      // Check status every 2 seconds to monitor changes
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  // Handle SSO completion message
  useEffect(() => {
    const handleSSOComplete = (event) => {
      if (event.origin !== 'https://uat.elbrit.org' && event.origin !== 'https://erp.elbrit.org') {
        return;
      }
      
      if (event.data && event.data.type === 'RAVEN_SSO_SUCCESS') {
        console.log('✅ Raven SSO authentication successful');
        setRavenAuthentication(true, event.data.userData);
        setRavenAuthStatus('authenticated');
        alert('✅ Raven SSO authentication successful! You can now access Raven directly.');
      }
    };

    window.addEventListener('message', handleSSOComplete);
    return () => window.removeEventListener('message', handleSSOComplete);
  }, []);

  const clearRavenAuth = () => {
    setRavenAuthentication(false);
    setRavenAuthStatus('not_authenticated');
    alert('❌ Raven authentication cleared. Next access will use SSO flow.');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading Authentication...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🔐 Raven SSO Authentication Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Firebase User:</strong> {user?.email || user?.phoneNumber || 'Not authenticated'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>🍪 ERP Cookie Status</h2>
        <p><strong>Cookie Status:</strong> {
          cookieStatus === 'checking' ? '⏳ Checking...' :
          cookieStatus === 'available' ? '✅ Available' : '❌ Unavailable'
        }</p>
        <p><strong>ERP Cookie Auth Available:</strong> {isERPCookieAuthAvailable() ? '✅ Yes' : '❌ No'}</p>
        
        {userInfo && (
          <div style={{ marginTop: '10px' }}>
            <h3>Extracted User Information:</h3>
            <ul>
              <li><strong>Full Name:</strong> {userInfo.fullName || 'Not available'}</li>
              <li><strong>User ID:</strong> {userInfo.userId || 'Not available'}</li>
              <li><strong>Email:</strong> {userInfo.email || 'Not available'}</li>
              <li><strong>System User:</strong> {userInfo.systemUser ? '✅ Yes' : '❌ No'}</li>
              <li><strong>Session ID:</strong> {userInfo.sessionId ? '✅ Available' : '❌ Missing'}</li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>🪶 Raven Authentication Status</h2>
        <p><strong>Raven Auth Status:</strong> {
          ravenAuthStatus === 'checking' ? '⏳ Checking...' :
          ravenAuthStatus === 'authenticated' ? '✅ Authenticated' : '❌ Not Authenticated'
        }</p>
        <p><strong>Has Raven Auth:</strong> {hasRavenAuthentication() ? '✅ Yes' : '❌ No'}</p>
        
        {ravenAuthStatus === 'authenticated' && (
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={clearRavenAuth}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Raven Authentication
            </button>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              This will force SSO login on next access
            </p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h2>🔗 Generated URLs</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <h3>SSO URL (UAT Login):</h3>
          {ssoUrl ? (
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              border: '1px solid #ddd'
            }}>
              {ssoUrl}
            </div>
          ) : (
            <p>❌ No SSO URL generated (ERP cookies not available)</p>
          )}
        </div>

        <div>
          <h3>Direct URL (No SSO):</h3>
          {directUrl ? (
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              border: '1px solid #ddd'
            }}>
              {directUrl}
            </div>
          ) : (
            <p>❌ No direct URL generated (ERP cookies not available)</p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Auto-Login Component (SSO Flow)</h2>
        <p>This component uses SSO flow for first-time login, then direct access for subsequent visits:</p>
        
        <RavenAutoLogin 
          height="500px"
          width="100%"
          showLoading={true}
          mode="iframe"
          onLoad={() => console.log('✅ Raven Auto-Login with SSO loaded successfully!')}
          onError={() => console.log('❌ Raven Auto-Login with SSO failed to load')}
          style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Embed Component (SSO Flow)</h2>
        <p>This component embeds Raven using SSO authentication:</p>
        
        <RavenEmbed 
          height="500px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven Embed with SSO loaded successfully!')}
          onError={() => console.log('❌ Raven Embed with SSO failed to load')}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>✅ SSO Flow Benefits</h2>
        <ul>
          <li><strong>First-time Login:</strong> Uses UAT SSO for initial authentication</li>
          <li><strong>Subsequent Access:</strong> Direct access to Raven (no repeated SSO)</li>
          <li><strong>Secure:</strong> ERP cookie data passed securely to UAT</li>
          <li><strong>Persistent:</strong> Authentication status stored locally</li>
          <li><strong>Fallback:</strong> Falls back to direct authentication if SSO fails</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>📋 SSO Flow Requirements</h2>
        <ul>
          <li>✅ <strong>Must be logged into ERP system</strong> (erp.elbrit.org)</li>
          <li>✅ <strong>ERP cookies must be present</strong> (full_name, user_id, sid, etc.)</li>
          <li>✅ <strong>UAT environment accessible</strong> (uat.elbrit.org)</li>
          <li>✅ <strong>Cross-origin messaging enabled</strong> for SSO completion</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>🔄 How SSO Flow Works</h2>
        <ol>
          <li><strong>Check Raven Auth:</strong> Check if user already has Raven authentication</li>
          <li><strong>If Authenticated:</strong> Use direct access to Raven</li>
          <li><strong>If Not Authenticated:</strong> Redirect to UAT SSO login with ERP cookie data</li>
          <li><strong>UAT Processing:</strong> UAT processes ERP cookie data and authenticates user</li>
          <li><strong>SSO Completion:</strong> UAT sends success message back to parent window</li>
          <li><strong>Store Auth:</strong> Store Raven authentication status locally</li>
          <li><strong>Future Access:</strong> Use direct access for subsequent visits</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>🔐 SSO Authentication provides seamless first-time login with persistent access!</strong></p>
        <p>Use these components in your Plasmic pages for the best user experience.</p>
      </div>
    </div>
  );
}
