import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { performERPLogin, getStoredERPData, clearStoredERPData } from '../components/utils/erpBackgroundLogin';

export default function TestERPDebug() {
  const { user, loading } = useAuth();
  const [erpData, setErpData] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const storedData = getStoredERPData();
      setErpData(storedData);
      
      // Collect debug information
      setDebugInfo({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          providerData: user.providerData
        },
        localStorage: {
          erpnextAuthToken: localStorage.getItem('erpnextAuthToken'),
          userEmail: localStorage.getItem('userEmail'),
          userDisplayName: localStorage.getItem('userDisplayName'),
          userPhoneNumber: localStorage.getItem('userPhoneNumber'),
          erpBackgroundLoginData: localStorage.getItem('erpBackgroundLoginData')
        },
        cookies: document.cookie
      });
    }
  }, [user]);

  const handleTestERPLogin = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Starting ERP login debug...');
      console.log('User:', user);
      
      const result = await performERPLogin(user);
      console.log('✅ ERP login result:', result);
      
      // Refresh stored data
      const storedData = getStoredERPData();
      setErpData(storedData);
      
      alert('ERP login completed! Check console for details.');
    } catch (error) {
      console.error('❌ ERP login failed:', error);
      alert('ERP login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    clearStoredERPData();
    setErpData(null);
    setDebugInfo({});
    console.log('🗑️ All data cleared');
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>ERP Login Debug</h1>
        <p>Please log in first to test ERP login.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 ERP Login Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleTestERPLogin}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          {isLoading ? '🔄 Testing...' : '🔍 Test ERP Login'}
        </button>
        
        <button
          onClick={handleClearData}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🗑️ Clear All Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>👤 User Information</h2>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px', 
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>

        <div>
          <h2>💾 LocalStorage Data</h2>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px', 
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>🍪 Browser Cookies</h2>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '12px',
          wordBreak: 'break-all'
        }}>
          {debugInfo.cookies}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>📊 Stored ERP Data</h2>
        {erpData ? (
          <pre style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '4px', 
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(erpData, null, 2)}
          </pre>
        ) : (
          <p style={{ color: '#6c757d' }}>No stored ERP data found</p>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>🔧 Debug Instructions</h2>
        <ol>
          <li>Click "Test ERP Login" to trigger the ERP login process</li>
          <li>Open browser DevTools Console to see detailed logs</li>
          <li>Check the "Available credentials" section in console</li>
          <li>Look for any error messages during login attempts</li>
          <li>Check if ERP cookies are being set after successful login</li>
        </ol>
        <p><strong>Expected Flow:</strong></p>
        <ul>
          <li>1. Check if already logged into ERP</li>
          <li>2. Try direct ERP login with multiple password strategies</li>
          <li>3. If direct fails, try server proxy</li>
          <li>4. If server proxy fails, try manual login window</li>
          <li>5. If all fail, create simulated data</li>
        </ul>
      </div>
    </div>
  );
}
