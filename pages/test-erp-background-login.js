import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';
import { 
  getStoredERPData, 
  isERPLoginNeeded,
  clearStoredERPData,
  performERPLogin
} from '../components/utils/erpBackgroundLogin';

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

export default function TestERPBackgroundLogin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [storedERPData, setStoredERPData] = useState(null);
  const [erpLoginStatus, setErpLoginStatus] = useState('checking');
  const [refreshKey, setRefreshKey] = useState(0);

  // Check stored ERP data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkStoredData = () => {
        const data = getStoredERPData();
        setStoredERPData(data);
        setErpLoginStatus(data ? 'available' : 'unavailable');
      };

      checkStoredData();
      
      // Check every 2 seconds to monitor changes
      const interval = setInterval(checkStoredData, 2000);
      return () => clearInterval(interval);
    }
  }, [refreshKey]);

  const handleClearERPData = () => {
    clearStoredERPData();
    setRefreshKey(prev => prev + 1);
  };

  const handleRefreshERPData = () => {
    // This would trigger a re-login in a real scenario
    window.location.reload();
  };

  const handleManualERPLogin = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    try {
      console.log('🔄 Starting manual ERP login...');
      const result = await performERPLogin(user);
      console.log('✅ Manual ERP login completed:', result);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('❌ Manual ERP login failed:', error);
      alert('ERP login failed: ' + error.message);
    }
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
      <h1>🔐 ERP Background Login + Raven Authentication Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Firebase Authentication Status</h2>
        <p><strong>User:</strong> {user?.email || user?.phoneNumber || 'Not authenticated'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Role:</strong> {user?.role || 'Not available'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>🔐 ERP Background Login Status</h2>
        <p><strong>Status:</strong> {
          erpLoginStatus === 'checking' ? '⏳ Checking...' :
          erpLoginStatus === 'available' ? '✅ Available' : '❌ Unavailable'
        }</p>
        <p><strong>ERP Login Needed:</strong> {isERPLoginNeeded(user) ? '⚠️ Yes' : '✅ No'}</p>
        
        {storedERPData && (
          <div style={{ marginTop: '10px' }}>
            <h3>Stored ERP Data:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <h4>ERPNext Data:</h4>
                <ul style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <li><strong>Token:</strong> {storedERPData.erpnextData?.token ? '✅ Available' : '❌ Missing'}</li>
                  <li><strong>User Email:</strong> {storedERPData.erpnextData?.user?.email || 'Not available'}</li>
                  <li><strong>User Role:</strong> {storedERPData.erpnextData?.user?.role || 'Not available'}</li>
                </ul>
              </div>
              <div>
                <h4>ERP Cookie Data:</h4>
                <ul style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <li><strong>Full Name:</strong> {storedERPData.cookieData?.full_name || 'Not available'}</li>
                  <li><strong>User ID:</strong> {storedERPData.cookieData?.user_id || 'Not available'}</li>
                  <li><strong>System User:</strong> {storedERPData.cookieData?.system_user || 'Not available'}</li>
                  <li><strong>Session ID:</strong> {storedERPData.cookieData?.sid ? '✅ Available' : '❌ Missing'}</li>
                  <li><strong>Data Source:</strong> {storedERPData.simulated ? '🔄 Simulated' : '🍪 Real Cookies'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleManualERPLogin}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔐 Manual ERP Login
          </button>
          <button
            onClick={handleRefreshERPData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh ERP Data
          </button>
          <button
            onClick={handleClearERPData}
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
            🗑️ Clear ERP Data
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>🔄 How ERP Background Login Works</h2>
        <ol>
          <li><strong>Firebase Authentication:</strong> User logs in via phone/Microsoft</li>
          <li><strong>ERPNext API Call:</strong> Authenticate with ERPNext using Firebase user data</li>
          <li><strong>Check ERP Login Status:</strong> Check if user is already logged into erp.elbrit.org</li>
          <li><strong>Manual ERP Login:</strong> If not logged in, open ERP login window for user to complete</li>
          <li><strong>Cookie Extraction:</strong> Extract ERP cookies after user completes login</li>
          <li><strong>Fallback Simulation:</strong> If manual login fails, create simulated cookie data</li>
          <li><strong>LocalStorage Storage:</strong> Store ERP data in localStorage for later use</li>
          <li><strong>Raven Authentication:</strong> Use stored ERP data for Raven auto-login</li>
        </ol>
        <p><strong>Note:</strong> The system first checks if the user is already logged into ERP. If not, it opens a new window for the user to complete ERP login manually, then extracts the resulting cookies.</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Auto-Login Component (Using Stored ERP Data)</h2>
        <p>This component uses the stored ERP data from background login:</p>
        
        <RavenAutoLogin 
          height="500px"
          width="100%"
          showLoading={true}
          mode="iframe"
          onLoad={() => console.log('✅ Raven Auto-Login with stored ERP data loaded successfully!')}
          onError={() => console.log('❌ Raven Auto-Login with stored ERP data failed to load')}
          style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Embed Component (Using Stored ERP Data)</h2>
        <p>This component embeds Raven using stored ERP data:</p>
        
        <RavenEmbed 
          height="500px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven Embed with stored ERP data loaded successfully!')}
          onError={() => console.log('❌ Raven Embed with stored ERP data failed to load')}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>✅ Benefits of ERP Background Login</h2>
        <ul>
          <li><strong>Seamless Integration:</strong> User logs in once, gets access to both ERP and Raven</li>
          <li><strong>Background Process:</strong> ERP login happens automatically without user interaction</li>
          <li><strong>Cookie Management:</strong> ERP cookies are extracted and stored for later use</li>
          <li><strong>Consistent Authentication:</strong> Same user context across all systems</li>
          <li><strong>Error Handling:</strong> Graceful fallback if background login fails</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>📋 Requirements for ERP Background Login</h2>
        <ul>
          <li>✅ <strong>Firebase Authentication</strong> - User must be logged in via Firebase</li>
          <li>✅ <strong>ERPNext API Access</strong> - ERPNext API must be accessible</li>
          <li>✅ <strong>ERP System Access</strong> - erp.elbrit.org must be accessible</li>
          <li>✅ <strong>Same Domain</strong> - Both systems must use .elbrit.org domain</li>
          <li>✅ <strong>Browser Support</strong> - Browser must support iframe and cookies</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h2>🔍 Debug Information</h2>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Refresh Key:</strong> {refreshKey}</p>
          <p><strong>Stored Data Keys:</strong> {storedERPData ? Object.keys(storedERPData).join(', ') : 'None'}</p>
          <p><strong>LocalStorage Keys:</strong> {typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.includes('erp') || k.includes('ERP')).join(', ') : 'N/A'}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>🔐 ERP Background Login ensures seamless authentication across all systems!</strong></p>
        <p>Users only need to log in once via Firebase, and everything else happens automatically.</p>
      </div>
    </div>
  );
}
