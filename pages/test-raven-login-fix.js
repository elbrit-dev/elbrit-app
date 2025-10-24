import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const RavenEmbed = dynamic(() => import('../components/RavenEmbed'), { ssr: false });
const RavenEmbedEnhanced = dynamic(() => import('../components/RavenEmbedEnhanced'), { ssr: false });

const TestRavenLoginFix = () => {
  const [activeComponent, setActiveComponent] = useState('enhanced');
  const [debugMode, setDebugMode] = useState(true);
  const [ravenUrl, setRavenUrl] = useState('https://erp.elbrit.org/raven');
  const [testResults, setTestResults] = useState([]);

  // Test different URLs and configurations
  const testConfigurations = [
    {
      name: 'Standard Raven URL',
      url: 'https://erp.elbrit.org/raven',
      description: 'Direct access to main Raven application'
    },
    {
      name: 'Raven Login URL',
      url: 'https://erp.elbrit.org/raven/login',
      description: 'Direct access to login page'
    },
    {
      name: 'Raven with Timestamp',
      url: `https://erp.elbrit.org/raven?_t=${Date.now()}`,
      description: 'Raven with cache-busting timestamp'
    },
    {
      name: 'Raven with Session',
      url: 'https://erp.elbrit.org/raven?session=test',
      description: 'Raven with session parameter'
    }
  ];

  const addTestResult = (test, result, details) => {
    const testResult = {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
  };

  const runUrlTest = async (config) => {
    addTestResult(config.name, 'testing', 'Starting URL test...');
    
    try {
      const response = await fetch(config.url, {
        method: 'HEAD',
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        addTestResult(config.name, 'success', `URL accessible (${response.status})`);
      } else {
        addTestResult(config.name, 'warning', `URL returned ${response.status}`);
      }
    } catch (error) {
      addTestResult(config.name, 'error', `Error: ${error.message}`);
    }
  };

  const runAllTests = () => {
    testConfigurations.forEach(config => {
      setTimeout(() => runUrlTest(config), 1000);
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Raven Login Fix Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>🎯 Problem Description</h2>
        <p>Users are experiencing login redirect loops where:</p>
        <ul>
          <li>✅ Login credentials are correct</li>
          <li>❌ After login, page refreshes back to login screen</li>
          <li>🔄 This happens for all users consistently</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>🔍 Possible Causes</h2>
        <ol>
          <li><strong>Session Management:</strong> Sessions not persisting in iframe context</li>
          <li><strong>Cookie Issues:</strong> SameSite or Secure cookie policies blocking iframe</li>
          <li><strong>CSRF Protection:</strong> Missing or invalid CSRF tokens</li>
          <li><strong>Redirect Loops:</strong> Application logic causing infinite redirects</li>
          <li><strong>Iframe Restrictions:</strong> Sandbox or security policies blocking session</li>
          <li><strong>Domain Mismatch:</strong> Session cookies not accessible across domains</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🧪 Component Testing</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => setActiveComponent('enhanced')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeComponent === 'enhanced' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Enhanced Component
          </button>
          <button
            onClick={() => setActiveComponent('standard')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeComponent === 'standard' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Standard Component
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Enable Debug Mode
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <label>Raven URL:</label>
          <input
            type="text"
            value={ravenUrl}
            onChange={(e) => setRavenUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔗 URL Testing</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={runAllTests}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Run All URL Tests
          </button>
          <button
            onClick={clearResults}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Results
          </button>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          {testResults.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No test results yet. Click "Run All URL Tests" to start.</p>
          ) : (
            testResults.map((result) => (
              <div key={result.id} style={{ 
                marginBottom: '5px', 
                fontSize: '12px',
                padding: '5px',
                backgroundColor: result.result === 'success' ? '#d4edda' : 
                                result.result === 'error' ? '#f8d7da' : 
                                result.result === 'warning' ? '#fff3cd' : '#e2e3e5',
                borderRadius: '3px'
              }}>
                <strong>{result.test}:</strong> {result.result} - {result.details}
                <br />
                <small style={{ color: '#6c757d' }}>{new Date(result.timestamp).toLocaleTimeString()}</small>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Embed Test</h2>
        <p><strong>Active Component:</strong> {activeComponent === 'enhanced' ? 'RavenEmbedEnhanced' : 'RavenEmbed'}</p>
        <p><strong>Debug Mode:</strong> {debugMode ? 'Enabled' : 'Disabled'}</p>
        <p><strong>URL:</strong> {ravenUrl}</p>
        
        <div style={{ border: '2px solid #007bff', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
          {activeComponent === 'enhanced' ? (
            <RavenEmbedEnhanced
              ravenUrl={ravenUrl}
              height="100%"
              width="100%"
              showLoading={true}
              enableDebug={debugMode}
              onLoad={() => console.log('✅ Enhanced Raven loaded')}
              onError={() => console.log('❌ Enhanced Raven error')}
            />
          ) : (
            <RavenEmbed
              ravenUrl={ravenUrl}
              height="100%"
              width="100%"
              showLoading={true}
              onLoad={() => console.log('✅ Standard Raven loaded')}
              onError={() => console.log('❌ Standard Raven error')}
            />
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>💡 Troubleshooting Steps</h2>
        <ol>
          <li><strong>Check Browser Console:</strong> Look for CORS errors, cookie issues, or JavaScript errors</li>
          <li><strong>Check Network Tab:</strong> See if requests are being made and what responses you get</li>
          <li><strong>Check Cookies:</strong> Verify if session cookies are being set and accessible</li>
          <li><strong>Test Direct Access:</strong> Open Raven URL directly in browser (not in iframe)</li>
          <li><strong>Check SameSite Policy:</strong> Look for SameSite cookie restrictions</li>
          <li><strong>Test Different Browsers:</strong> See if issue is browser-specific</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>🛠️ Quick Fixes to Try</h2>
        <ul>
          <li><strong>Clear Browser Data:</strong> Clear cookies, cache, and local storage</li>
          <li><strong>Disable Extensions:</strong> Try in incognito/private mode</li>
          <li><strong>Check Firewall:</strong> Ensure no blocking of iframe content</li>
          <li><strong>Try Different URL:</strong> Test with different Raven endpoints</li>
          <li><strong>Check Server Logs:</strong> Look at Raven server logs for errors</li>
        </ul>
      </div>
    </div>
  );
};

export default TestRavenLoginFix;
