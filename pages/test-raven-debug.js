import React, { useState, useEffect } from 'react';
import RavenEmbed from '../components/RavenEmbed';

const TestRavenDebug = () => {
  const [currentUrl, setCurrentUrl] = useState('https://erp.elbrit.org');
  const [urlHistory, setUrlHistory] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});

  // Track URL changes in iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Listen for messages from iframe
      if (event.origin === 'https://erp.elbrit.org') {
        console.log('📨 Message from Raven iframe:', event.data);
        setDebugInfo(prev => ({
          ...prev,
          lastMessage: event.data,
          timestamp: new Date().toISOString()
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Test different URLs
  const testUrls = [
    { name: 'Main Raven URL', url: 'https://erp.elbrit.org' },
    { name: 'Raven Login URL', url: 'https://erp.elbrit.org/login' },
    { name: 'Raven with timestamp', url: `https://erp.elbrit.org?_t=${Date.now()}` },
    { name: 'Raven with auto_login', url: 'https://erp.elbrit.org?auto_login=true' },
    { name: 'Raven with session', url: 'https://erp.elbrit.org?session=test' }
  ];

  const handleUrlChange = (url) => {
    setCurrentUrl(url);
    setUrlHistory(prev => [...prev, { url, timestamp: new Date().toISOString() }]);
  };

  const clearHistory = () => {
    setUrlHistory([]);
    setDebugInfo({});
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Raven Login Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 Debug Information</h3>
        <p><strong>Current URL:</strong> {currentUrl}</p>
        <p><strong>URL History Count:</strong> {urlHistory.length}</p>
        <p><strong>Last Message:</strong> {debugInfo.lastMessage || 'None'}</p>
        <p><strong>Last Message Time:</strong> {debugInfo.timestamp || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🧪 Test Different URLs</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {testUrls.map((testUrl, index) => (
            <button
              key={index}
              onClick={() => handleUrlChange(testUrl.url)}
              style={{
                padding: '8px 12px',
                backgroundColor: currentUrl === testUrl.url ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {testUrl.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📋 URL History</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          {urlHistory.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No URL changes yet</p>
          ) : (
            urlHistory.slice(-10).reverse().map((entry, index) => (
              <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
                <strong>{new Date(entry.timestamp).toLocaleTimeString()}:</strong> {entry.url}
              </div>
            ))
          )}
        </div>
        <button
          onClick={clearHistory}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear History
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔧 Manual URL Input</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="Enter Raven URL to test"
          />
          <button
            onClick={() => handleUrlChange(currentUrl)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load URL
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📱 Raven Embed Test</h3>
        <div style={{ border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
          <RavenEmbed
            ravenUrl={currentUrl}
            height="600px"
            width="100%"
            onLoad={() => console.log('✅ Raven iframe loaded')}
            onError={() => console.log('❌ Raven iframe error')}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔍 Troubleshooting Steps</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>Check Console:</strong> Open browser dev tools and check for any errors</li>
          <li><strong>Network Tab:</strong> Check if requests to Raven are being made and their responses</li>
          <li><strong>Cookies:</strong> Check if any cookies are being set by Raven</li>
          <li><strong>Session Storage:</strong> Check if Raven is using sessionStorage or localStorage</li>
          <li><strong>Redirects:</strong> Check if there are any redirects happening</li>
          <li><strong>CORS Issues:</strong> Check if there are any cross-origin issues</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>💡 Common Issues & Solutions</h3>
        <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <h4>Login Loop Issues:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Session cookies not being set properly</li>
            <li>CSRF token issues</li>
            <li>Authentication state not persisting</li>
            <li>Redirect loops in the application</li>
            <li>Iframe sandbox restrictions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestRavenDebug;
