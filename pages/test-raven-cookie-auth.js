import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';
import { 
  getERPCookieData, 
  getStoredERPCookieData,
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable,
  isUserLoggedIntoERP,
  buildRavenUrlWithCookieAuth,
  redirectToERPLogin
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
      <p>Loading Raven Auto Login Component...</p>
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
      <p>Loading Raven Embed Component...</p>
    </div>
  )
});

export default function TestRavenCookieAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const [cookieData, setCookieData] = useState(null);
  const [storedCookieData, setStoredCookieData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [cookieStatus, setCookieStatus] = useState('checking');
  const [erpLoginStatus, setErpLoginStatus] = useState('checking');
  const [ravenUrl, setRavenUrl] = useState('');

  // Check ERP cookie data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkCookies = () => {
        // Check ERP login status
        const isLoggedIn = isUserLoggedIntoERP();
        setErpLoginStatus(isLoggedIn ? 'logged_in' : 'not_logged_in');

        // Get fresh ERP cookie data
        const erpCookies = getERPCookieData();
        
        // Get stored ERP cookie data as fallback
        const storedCookies = getStoredERPCookieData();
        setStoredCookieData(storedCookies);

        const isValid = validateERPCookieData(erpCookies);
        const userInfo = extractUserInfoFromCookies(erpCookies);
        const isAvailable = isERPCookieAuthAvailable();

        setCookieData(erpCookies);
        setUserInfo(userInfo);
        setCookieStatus(isAvailable ? 'available' : 'unavailable');

        // Build Raven URL if cookies are available (fresh or stored)
        const cookiesToUse = erpCookies || storedCookies;
        if (isAvailable && cookiesToUse) {
          const url = buildRavenUrlWithCookieAuth('https://erp.elbrit.org/raven', cookiesToUse);
          setRavenUrl(url);
        }
      };

      checkCookies();
      
      // Check cookies every 2 seconds to monitor changes
      const interval = setInterval(checkCookies, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading Authentication...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🍪 Raven ERP Cookie Authentication Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Firebase User:</strong> {user?.email || user?.phoneNumber || 'Not authenticated'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>🍪 ERP Login & Cookie Status</h2>
        <p><strong>ERP Login Status:</strong> {
          erpLoginStatus === 'checking' ? '⏳ Checking...' :
          erpLoginStatus === 'logged_in' ? '✅ Logged In' : '❌ Not Logged In'
        }</p>
        <p><strong>Cookie Status:</strong> {
          cookieStatus === 'checking' ? '⏳ Checking...' :
          cookieStatus === 'available' ? '✅ Available' : '❌ Unavailable'
        }</p>
        <p><strong>ERP Cookie Auth Available:</strong> {isERPCookieAuthAvailable() ? '✅ Yes' : '❌ No'}</p>
        
        {erpLoginStatus === 'not_logged_in' && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#e65100' }}>
              🔄 ERP authentication will happen automatically in the background
            </p>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px' }}>
              A hidden iframe will handle the ERP login process without interrupting your workflow
            </p>
            <button
              onClick={() => redirectToERPLogin(window.location.href)}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Manual ERP Login (if needed)
            </button>
          </div>
        )}
        
        {cookieData && (
          <div style={{ marginTop: '10px' }}>
            <h3>Fresh ERP Cookies:</h3>
            <ul style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {Object.keys(cookieData).map(key => (
                <li key={key}>
                  <strong>{key}:</strong> {cookieData[key] ? '✅ Available' : '❌ Missing'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {storedCookieData && !cookieData && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <h3>📦 Stored ERP Cookie Data (Fallback):</h3>
            <p style={{ fontSize: '12px', color: '#2e7d32' }}>
              Using stored cookie data as fallback (last updated: {storedCookieData.lastUpdated})
            </p>
            <ul style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {Object.keys(storedCookieData).filter(key => key !== 'lastUpdated').map(key => (
                <li key={key}>
                  <strong>{key}:</strong> {storedCookieData[key] ? '✅ Available' : '❌ Missing'}
                </li>
              ))}
            </ul>
          </div>
        )}

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
        <h2>🔗 Generated Raven URL</h2>
        {ravenUrl ? (
          <div>
            <p><strong>Raven URL with ERP Cookie Auth:</strong></p>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              border: '1px solid #ddd'
            }}>
              {ravenUrl}
            </div>
          </div>
        ) : (
          <p>❌ No Raven URL generated (ERP cookies not available)</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Auto-Login Component (ERP Cookie Auth)</h2>
        <p>This component automatically uses ERP cookie data for authentication:</p>
        
        <RavenAutoLogin 
          height="500px"
          width="100%"
          showLoading={true}
          mode="iframe"
          onLoad={() => console.log('✅ Raven Auto-Login with ERP cookies loaded successfully!')}
          onError={() => console.log('❌ Raven Auto-Login with ERP cookies failed to load')}
          style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Embed Component (ERP Cookie Auth)</h2>
        <p>This component embeds Raven using ERP cookie authentication:</p>
        
        <RavenEmbed 
          height="500px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven Embed with ERP cookies loaded successfully!')}
          onError={() => console.log('❌ Raven Embed with ERP cookies failed to load')}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>✅ Benefits of Background ERP Cookie Authentication</h2>
        <ul>
          <li><strong>Seamless Experience:</strong> ERP login happens in background without interrupting user workflow</li>
          <li><strong>Shared Domain:</strong> Both Raven and ERP use the same cookie domain (.elbrit.org)</li>
          <li><strong>Automatic Authentication:</strong> Cookies are automatically sent by the browser</li>
          <li><strong>Secure:</strong> No need to pass sensitive tokens in URLs</li>
          <li><strong>Consistent:</strong> User is authenticated in both ERP and Raven systems</li>
          <li><strong>Real-time:</strong> Cookie changes are monitored automatically</li>
          <li><strong>Hidden Process:</strong> Uses hidden iframe for background ERP login</li>
          <li><strong>Fallback Support:</strong> Uses stored cookie data if fresh cookies aren't available</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>📋 How Background ERP Login Works</h2>
        <ol>
          <li><strong>Initial Check:</strong> System checks if user is logged into ERP</li>
          <li><strong>Background Process:</strong> If not logged in, hidden iframe loads ERP login page</li>
          <li><strong>Automatic Login:</strong> User can login through the hidden iframe (if needed)</li>
          <li><strong>Cookie Detection:</strong> System monitors for ERP cookies to be set</li>
          <li><strong>Data Storage:</strong> ERP cookie data is extracted and stored in localStorage</li>
          <li><strong>Raven Authentication:</strong> Uses ERP cookies to authenticate with Raven</li>
          <li><strong>Fallback:</strong> Uses stored cookie data if fresh cookies aren't available</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>🍪 ERP Cookie Authentication provides seamless integration between ERP and Raven!</strong></p>
        <p>Use these components in your Plasmic pages for the best user experience.</p>
      </div>
    </div>
  );
}
