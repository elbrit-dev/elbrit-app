import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';

export default function TestRavenQuick() {
  const { user, isAuthenticated, loading } = useAuth();
  const [authData, setAuthData] = useState(null);
  const [ravenUrl, setRavenUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('erpnextAuthToken');
      const userEmail = localStorage.getItem('userEmail');
      const provider = localStorage.getItem('authProvider');
      
      setAuthData({
        token: token,
        email: userEmail,
        provider: provider
      });

      if (token && userEmail) {
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('email', userEmail);
        if (provider) params.append('provider', provider);
        params.append('_t', Date.now().toString());
        
        setRavenUrl(`https://uat.elbrit.org/raven?${params.toString()}`);
      }
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🪶 Quick Raven Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>User Email:</strong> {user?.email || 'Not available'}</p>
        <p><strong>User Role:</strong> {user?.role || 'Not available'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fff0', borderRadius: '8px' }}>
        <h2>LocalStorage Data</h2>
        <p><strong>Token Available:</strong> {authData?.token ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Email Available:</strong> {authData?.email ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Provider:</strong> {authData?.provider || 'Not available'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff8f0', borderRadius: '8px' }}>
        <h2>Generated Raven URL</h2>
        {ravenUrl ? (
          <div>
            <p><strong>✅ URL Generated Successfully</strong></p>
            <p style={{ fontSize: '12px', wordBreak: 'break-all', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {ravenUrl.replace(authData?.token || '', '[TOKEN_REDACTED]')}
            </p>
          </div>
        ) : (
          <p><strong>❌ Cannot generate URL - missing auth data</strong></p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Raven Access</h2>
        {ravenUrl ? (
          <div>
            <p>Click the button below to test if Raven loads with authentication:</p>
            <button
              onClick={() => window.open(ravenUrl, '_blank')}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                marginRight: '10px'
              }}
            >
              🪶 Open Raven in New Tab
            </button>
            <button
              onClick={() => {
                const iframe = document.getElementById('raven-test-iframe');
                if (iframe) {
                  iframe.src = ravenUrl;
                }
              }}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              📱 Load in iframe Below
            </button>
          </div>
        ) : (
          <p>❌ Cannot test - please login first</p>
        )}
      </div>

      {ravenUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Raven iframe Test:</h3>
          <iframe
            id="raven-test-iframe"
            src=""
            style={{
              width: '100%',
              height: '500px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}
            title="Raven Test"
          />
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>If Raven loads and you're logged in:</strong> Integration works 100%!</li>
          <li>⚠️ <strong>If Raven loads but asks for login:</strong> Need to modify Raven backend</li>
          <li>❌ <strong>If Raven doesn't load:</strong> Check CORS/iframe settings</li>
          <li>❌ <strong>If no URL generated:</strong> Check authentication data</li>
        </ul>
      </div>
    </div>
  );
}
