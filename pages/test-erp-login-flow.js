import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';
import { 
  getERPAuthData,
  getStoredERPCookieData,
  getStoredERPUserInfo,
  isStoredERPDataValid,
  isERPCookieAuthAvailable
} from '../components/utils/erpCookieAuth';

// Dynamically import components to avoid SSR issues
const ERPLogin = dynamic(() => import('../components/ERPLogin'), { 
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
      <p>Loading ERP Login Component...</p>
    </div>
  )
});

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

export default function TestERPLoginFlow() {
  const { user, loading, isAuthenticated } = useAuth();
  const [erpStatus, setErpStatus] = useState('checking');
  const [storedData, setStoredData] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check ERP data status
  const checkERPData = () => {
    if (typeof window === 'undefined') return;

    // Check stored data
    const storedCookies = getStoredERPCookieData();
    const storedUserInfo = getStoredERPUserInfo();
    const isStoredValid = isStoredERPDataValid();
    
    // Check live data
    const liveAuthData = getERPAuthData();
    const isLiveAvailable = isERPCookieAuthAvailable();

    setStoredData({
      cookies: storedCookies,
      userInfo: storedUserInfo,
      isValid: isStoredValid,
      loginTime: localStorage.getItem('erpLoginTime')
    });

    setLiveData({
      authData: liveAuthData,
      isAvailable: isLiveAvailable
    });

    // Determine overall status
    if (isLiveAvailable || (storedCookies && isStoredValid)) {
      setErpStatus('available');
    } else if (storedCookies && !isStoredValid) {
      setErpStatus('expired');
    } else {
      setErpStatus('unavailable');
    }
  };

  // Check data on mount and periodically
  useEffect(() => {
    checkERPData();
    
    const interval = setInterval(checkERPData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle ERP login success
  const handleERPLoginSuccess = (data) => {
    console.log('✅ ERP Login Success:', data);
    checkERPData();
    setRefreshKey(prev => prev + 1);
  };

  // Handle ERP login error
  const handleERPLoginError = (error) => {
    console.error('❌ ERP Login Error:', error);
  };

  // Clear stored data
  const clearStoredData = () => {
    localStorage.removeItem('erpCookieData');
    localStorage.removeItem('erpUserInfo');
    localStorage.removeItem('erpLoginTime');
    checkERPData();
    setRefreshKey(prev => prev + 1);
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
      <h1>🔐 ERP Login Flow Test</h1>
      <p>This page demonstrates the complete ERP login flow and how it enables Raven auto-login.</p>
      
      {/* Firebase Auth Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Firebase Authentication Status</h2>
        <p><strong>User:</strong> {user?.email || user?.phoneNumber || 'Not authenticated'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      {/* ERP Login Component */}
      <div style={{ marginBottom: '20px' }}>
        <h2>🔐 Step 1: ERP Login</h2>
        <p>First, ensure you are logged into the ERP system. This component will check and store ERP cookie data.</p>
        
        <ERPLogin 
          erpUrl="https://erp.elbrit.org"
          showStatus={true}
          autoCheck={true}
          onLoginSuccess={handleERPLoginSuccess}
          onLoginError={handleERPLoginError}
          style={{ marginBottom: '20px' }}
        />
      </div>

      {/* ERP Data Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>🍪 Step 2: ERP Data Status</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Stored Data */}
          <div>
            <h3>Stored Data (localStorage)</h3>
            <p><strong>Status:</strong> {
              storedData?.isValid ? '✅ Valid' : 
              storedData?.cookies ? '⚠️ Expired' : '❌ Not Available'
            }</p>
            {storedData?.loginTime && (
              <p><strong>Login Time:</strong> {new Date(storedData.loginTime).toLocaleString()}</p>
            )}
            {storedData?.userInfo && (
              <div>
                <p><strong>User:</strong> {storedData.userInfo.fullName}</p>
                <p><strong>Email:</strong> {storedData.userInfo.userId}</p>
                <p><strong>System User:</strong> {storedData.userInfo.systemUser ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>

          {/* Live Data */}
          <div>
            <h3>Live Data (Cookies)</h3>
            <p><strong>Status:</strong> {liveData?.isAvailable ? '✅ Available' : '❌ Not Available'}</p>
            {liveData?.authData && (
              <div>
                <p><strong>Source:</strong> {liveData.authData.source}</p>
                <p><strong>User:</strong> {liveData.authData.userInfo?.fullName}</p>
                <p><strong>Email:</strong> {liveData.authData.userInfo?.userId}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={checkERPData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Data
          </button>
          <button
            onClick={clearStoredData}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Stored Data
          </button>
        </div>
      </div>

      {/* Raven Components */}
      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Step 3: Raven Auto-Login (Using ERP Data)</h2>
        <p>These components will automatically use the ERP data for authentication:</p>
        
        {erpStatus === 'available' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3>Raven Auto-Login Component</h3>
              <RavenAutoLogin 
                key={`raven-autologin-${refreshKey}`}
                height="400px"
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

            <div style={{ marginBottom: '20px' }}>
              <h3>Raven Embed Component</h3>
              <RavenEmbed 
                key={`raven-embed-${refreshKey}`}
                height="400px"
                width="100%"
                showLoading={true}
                onLoad={() => console.log('✅ Raven Embed loaded successfully!')}
                onError={() => console.log('❌ Raven Embed failed to load')}
                style={{
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{
            padding: '20px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#856404' }}>⚠️ ERP Data Required</h3>
            <p style={{ color: '#856404' }}>
              Please complete ERP login first to enable Raven auto-login.
            </p>
          </div>
        )}
      </div>

      {/* Flow Explanation */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>📋 Complete Flow Explanation</h2>
        <ol>
          <li><strong>ERP Login:</strong> User logs into erp.elbrit.org (or uses existing session)</li>
          <li><strong>Cookie Detection:</strong> ERPLogin component detects ERP cookies</li>
          <li><strong>Data Storage:</strong> ERP cookie data is stored in localStorage</li>
          <li><strong>Raven Authentication:</strong> Raven components use stored ERP data</li>
          <li><strong>Auto-Login:</strong> Raven receives ERP data and authenticates user automatically</li>
        </ol>
      </div>

      {/* Benefits */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h2>✅ Benefits of This Approach</h2>
        <ul>
          <li><strong>Reliable:</strong> ERP login is verified before attempting Raven authentication</li>
          <li><strong>Efficient:</strong> Stored data is used first, with live cookies as fallback</li>
          <li><strong>Secure:</strong> No sensitive data exposed in URLs</li>
          <li><strong>User-Friendly:</strong> Clear status indicators and error messages</li>
          <li><strong>Maintainable:</strong> Centralized ERP data management</li>
        </ul>
      </div>

      {/* Technical Details */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>🔧 Technical Details</h2>
        <h3>localStorage Keys Used:</h3>
        <ul style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          <li><strong>erpCookieData:</strong> Raw ERP cookie data</li>
          <li><strong>erpUserInfo:</strong> Extracted user information</li>
          <li><strong>erpLoginTime:</strong> Timestamp of ERP login</li>
        </ul>
        
        <h3>Data Flow:</h3>
        <ol style={{ fontSize: '14px' }}>
          <li>ERPLogin component monitors ERP cookies</li>
          <li>Valid cookie data is stored in localStorage</li>
          <li>Raven components check stored data first (with 30min expiry)</li>
          <li>If stored data is expired, fallback to live cookies</li>
          <li>Raven URL is built with ERP authentication parameters</li>
        </ol>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p><strong>🎯 This approach ensures ERP authentication works first, then enables seamless Raven auto-login!</strong></p>
      </div>
    </div>
  );
}
