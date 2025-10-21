import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import RavenEmbed from '../components/RavenEmbed';
import { hasStoredERPCredentials, clearERPCredentials, getERPLoginStatus } from '../components/utils/erpOneTimeCredentials';

export default function TestOneTimeERPLogin() {
  const { user, loading } = useAuth();
  const [loginStatus, setLoginStatus] = useState(null);
  const [showRaven, setShowRaven] = useState(false);

  useEffect(() => {
    if (user) {
      const status = getERPLoginStatus(user);
      setLoginStatus(status);
    }
  }, [user]);

  const handleClearCredentials = () => {
    if (user) {
      clearERPCredentials(user);
      setLoginStatus(getERPLoginStatus(user));
      setShowRaven(false);
      console.log('🗑️ ERP credentials cleared');
    }
  };

  const handleShowRaven = () => {
    setShowRaven(true);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>One-Time ERP Login Test</h1>
        <p>Please log in first to test the one-time ERP login functionality.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔐 One-Time ERP Login Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
        <h2>💡 How One-Time ERP Login Works</h2>
        <ol>
          <li><strong>First Visit:</strong> User sees ERP login popup modal</li>
          <li><strong>One-Time Login:</strong> User enters ERP email/password once</li>
          <li><strong>Permanent Storage:</strong> Credentials stored securely in browser</li>
          <li><strong>Future Visits:</strong> No more popups - automatic login</li>
          <li><strong>Raven Auto-Login:</strong> Uses stored credentials for chat</li>
        </ol>
        <p><strong>Benefits:</strong> No more 403 errors, no repeated logins, seamless experience!</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>📊 Current Status</h2>
        {loginStatus ? (
          <div style={{
            padding: '15px',
            backgroundColor: loginStatus.hasCredentials ? '#d4edda' : '#fff3cd',
            borderRadius: '8px',
            border: `1px solid ${loginStatus.hasCredentials ? '#c3e6cb' : '#ffeaa7'}`
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: loginStatus.hasCredentials ? '#155724' : '#856404' }}>
              {loginStatus.hasCredentials ? '✅ ERP Credentials Stored' : '⚠️ No ERP Credentials'}
            </h3>
            <p><strong>Has Credentials:</strong> {loginStatus.hasCredentials ? 'Yes' : 'No'}</p>
            {loginStatus.hasCredentials && (
              <>
                <p><strong>Email:</strong> {loginStatus.credentials?.email}</p>
                <p><strong>Last Used:</strong> {loginStatus.lastUsed ? new Date(loginStatus.lastUsed).toLocaleString() : 'Never'}</p>
                <p><strong>Remember Me:</strong> {loginStatus.credentials?.rememberMe ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        ) : (
          <p>Loading status...</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleShowRaven}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          🪶 Show Raven Chat
        </button>
        
        <button
          onClick={handleClearCredentials}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🗑️ Clear ERP Credentials
        </button>
      </div>

      {showRaven && (
        <div style={{ marginTop: '20px' }}>
          <h2>🪶 Raven Chat (with One-Time ERP Login)</h2>
          <div style={{ 
            border: '2px solid #28a745', 
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <RavenEmbed 
              height="600px"
              width="100%"
              showLoading={true}
              onLoad={() => console.log('✅ Raven loaded successfully!')}
              onError={() => console.log('❌ Raven failed to load')}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
        <h2>🎉 Expected Behavior</h2>
        <ul>
          <li><strong>First Time:</strong> ERP login popup appears when you click "Show Raven Chat"</li>
          <li><strong>After Login:</strong> Popup disappears, Raven loads with your ERP credentials</li>
          <li><strong>Future Visits:</strong> No popup - Raven loads directly with stored credentials</li>
          <li><strong>After Clear:</strong> Popup appears again on next visit (simulates first time)</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>🔧 Testing Steps</h2>
        <ol>
          <li>Click "Clear ERP Credentials" to simulate first visit</li>
          <li>Click "Show Raven Chat" - you should see ERP login popup</li>
          <li>Enter your ERP email and password in the popup</li>
          <li>Click "Login to ERP" - popup should disappear, Raven should load</li>
          <li>Refresh the page and click "Show Raven Chat" again</li>
          <li>No popup should appear - Raven should load directly</li>
        </ol>
      </div>
    </div>
  );
}
