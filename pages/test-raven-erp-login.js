import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';
import { 
  getERPCookieData, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable,
  debugAllCookies
} from '../components/utils/erpCookieAuth';

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
      <p>Loading Raven Embed Component...</p>
    </div>
  )
});

export default function TestRavenERPLogin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [cookieData, setCookieData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [cookieStatus, setCookieStatus] = useState('checking');
  const [storedData, setStoredData] = useState(null);

  // Check ERP cookie data and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkData = () => {
        // Check fresh cookies
        const erpCookies = getERPCookieData();
        const isValid = validateERPCookieData(erpCookies);
        const userInfo = extractUserInfoFromCookies(erpCookies);
        const isAvailable = isERPCookieAuthAvailable();

        setCookieData(erpCookies);
        setUserInfo(userInfo);
        setCookieStatus(isAvailable ? 'available' : 'unavailable');

        // Check stored data
        try {
          const storedCookieData = localStorage.getItem('erpCookieData');
          const storedUserInfo = localStorage.getItem('erpUserInfo');
          const loginTime = localStorage.getItem('erpLoginTime');

          setStoredData({
            cookieData: storedCookieData ? JSON.parse(storedCookieData) : null,
            userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : null,
            loginTime: loginTime
          });
        } catch (error) {
          console.error('Error reading stored data:', error);
        }
      };

      checkData();
      
      // Check data every 3 seconds to monitor changes
      const interval = setInterval(checkData, 3000);
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
      <h1>🔐 Raven ERP Login Integration Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Firebase User:</strong> {user?.email || user?.phoneNumber || 'Not authenticated'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>🍪 ERP Cookie Status</h2>
        <p><strong>Fresh Cookie Status:</strong> {
          cookieStatus === 'checking' ? '⏳ Checking...' :
          cookieStatus === 'available' ? '✅ Available' : '❌ Unavailable'
        }</p>
        <p><strong>ERP Cookie Auth Available:</strong> {isERPCookieAuthAvailable() ? '✅ Yes' : '❌ No'}</p>
        
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

        {userInfo && (
          <div style={{ marginTop: '10px' }}>
            <h3>Fresh User Information:</h3>
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
        <h2>💾 Stored Data in localStorage</h2>
        {storedData ? (
          <div>
            <p><strong>Stored Cookie Data:</strong> {storedData.cookieData ? '✅ Available' : '❌ Not stored'}</p>
            <p><strong>Stored User Info:</strong> {storedData.userInfo ? '✅ Available' : '❌ Not stored'}</p>
            <p><strong>Login Time:</strong> {storedData.loginTime || 'Not available'}</p>
            
            {storedData.userInfo && (
              <div style={{ marginTop: '10px' }}>
                <h3>Stored User Information:</h3>
                <ul>
                  <li><strong>Full Name:</strong> {storedData.userInfo.fullName || 'Not available'}</li>
                  <li><strong>User ID:</strong> {storedData.userInfo.userId || 'Not available'}</li>
                  <li><strong>Email:</strong> {storedData.userInfo.email || 'Not available'}</li>
                  <li><strong>System User:</strong> {storedData.userInfo.systemUser ? '✅ Yes' : '❌ No'}</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>❌ No stored data found in localStorage</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Embed with ERP Login Integration</h2>
        <p>This component will:</p>
        <ol>
          <li>✅ <strong>Check for ERP login status</strong> (fresh cookies or stored data)</li>
          <li>✅ <strong>Show ERP login modal</strong> if not logged in (one-time setup)</li>
          <li>✅ <strong>Open ERP login popup</strong> to <code>https://erp.elbrit.org/login#login?provider=office365</code></li>
          <li>✅ <strong>Automatically use Office 365 login</strong> for seamless authentication</li>
          <li>✅ <strong>Store ERP data in localStorage</strong> after successful login</li>
          <li>✅ <strong>Use ERP data for Raven authentication</strong> automatically</li>
          <li>✅ <strong>Provide seamless experience</strong> for future visits</li>
        </ol>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
          <h3>Expected Behavior:</h3>
          <ul>
            <li><strong>If ERP cookies are available:</strong> Raven will load directly with auto-login</li>
            <li><strong>If no ERP cookies but stored data exists:</strong> Raven will use stored data</li>
            <li><strong>If no ERP data at all:</strong> ERP login modal will appear</li>
            <li><strong>After ERP login:</strong> Data is stored and Raven loads automatically</li>
          </ul>
        </div>
        
        <RavenEmbed 
          height="600px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven Embed with ERP login loaded successfully!')}
          onError={() => console.log('❌ Raven Embed with ERP login failed to load')}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '20px'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>🧪 Testing Instructions</h2>
        <ol>
          <li><strong>First Visit (No ERP Login):</strong>
            <ul>
              <li>Clear localStorage and cookies</li>
              <li>Refresh the page</li>
              <li>ERP login modal should appear</li>
            <li>Click "Login to ERP" to open popup</li>
            <li>Complete Office 365 login in popup (automatic)</li>
              <li>Modal should close and Raven should load</li>
            </ul>
          </li>
          <li><strong>Subsequent Visits (With Stored Data):</strong>
            <ul>
              <li>Refresh the page</li>
              <li>Raven should load directly using stored data</li>
              <li>No ERP login modal should appear</li>
            </ul>
          </li>
          <li><strong>Fresh ERP Cookies:</strong>
            <ul>
              <li>If you're logged into ERP in another tab</li>
              <li>Raven should use fresh cookies and update stored data</li>
            </ul>
          </li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <h3>🔧 Debug Tools</h3>
          <button
            onClick={() => {
              console.log('🔍 Debug: Checking all cookies...');
              debugAllCookies();
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Debug All Cookies
          </button>
          <button
            onClick={() => {
              console.log('🔍 Debug: Checking ERP auth status...');
              const isAvailable = isERPCookieAuthAvailable();
              console.log('ERP Auth Available:', isAvailable);
            }}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Check ERP Auth Status
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h2>✅ Benefits of This Implementation</h2>
        <ul>
          <li><strong>One-Time Setup:</strong> Users only need to login to ERP once</li>
          <li><strong>Persistent Storage:</strong> ERP data is stored in localStorage</li>
          <li><strong>Fresh Cookie Priority:</strong> Always uses fresh cookies when available</li>
          <li><strong>Seamless Experience:</strong> No repeated login prompts</li>
          <li><strong>Secure:</strong> Uses existing ERP authentication system</li>
          <li><strong>Automatic Updates:</strong> Fresh data updates stored data automatically</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>🔐 This implementation provides the most user-friendly ERP-Raven integration!</strong></p>
        <p>Users get a one-time ERP login experience with lifetime access to Raven.</p>
      </div>
    </div>
  );
}
