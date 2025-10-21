import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { performERPLogin, getStoredERPData, clearStoredERPData } from '../components/utils/erpBackgroundLogin';

export default function TestSystemERPLogin() {
  const { user, loading } = useAuth();
  const [erpData, setErpData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    if (user) {
      const storedData = getStoredERPData();
      setErpData(storedData);
    }
  }, [user]);

  const handleTestSystemLogin = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    
    try {
      console.log('🔍 Testing system-level ERP login...');
      
      // Test 1: Try to create system session via API
      const test1 = await testSystemSessionAPI();
      setTestResults(prev => [...prev, test1]);
      
      // Test 2: Try direct ERP login
      const test2 = await testDirectERPLogin();
      setTestResults(prev => [...prev, test2]);
      
      // Test 3: Try the full ERP login process
      const test3 = await testFullERPLogin();
      setTestResults(prev => [...prev, test3]);
      
    } catch (error) {
      console.error('❌ System ERP login test failed:', error);
      setTestResults(prev => [...prev, {
        name: 'Error',
        status: 'error',
        message: error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testSystemSessionAPI = async () => {
    try {
      console.log('🔄 Test 1: System Session API...');
      
      const response = await fetch('/api/erpnext/create-system-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userData: { displayName: user.displayName },
          erpnextData: { user: { email: user.email } }
        })
      });
      
      const result = await response.json();
      
      return {
        name: 'System Session API',
        status: response.ok ? 'success' : 'error',
        message: result.message || result.error,
        details: result
      };
    } catch (error) {
      return {
        name: 'System Session API',
        status: 'error',
        message: error.message
      };
    }
  };

  const testDirectERPLogin = async () => {
    try {
      console.log('🔄 Test 2: Direct ERP Login...');
      
      const response = await fetch('/api/erpnext/erp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          token: 'test_token',
          displayName: user.displayName
        })
      });
      
      const result = await response.json();
      
      return {
        name: 'Direct ERP Login',
        status: response.ok ? 'success' : 'error',
        message: result.message || result.error,
        details: result
      };
    } catch (error) {
      return {
        name: 'Direct ERP Login',
        status: 'error',
        message: error.message
      };
    }
  };

  const testFullERPLogin = async () => {
    try {
      console.log('🔄 Test 3: Full ERP Login Process...');
      
      const result = await performERPLogin(user);
      
      return {
        name: 'Full ERP Login Process',
        status: 'success',
        message: 'ERP login process completed',
        details: result
      };
    } catch (error) {
      return {
        name: 'Full ERP Login Process',
        status: 'error',
        message: error.message
      };
    }
  };

  const handleClearData = () => {
    clearStoredERPData();
    setErpData(null);
    setTestResults([]);
    console.log('🗑️ All data cleared');
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>System ERP Login Test</h1>
        <p>Please log in first to test system-level ERP login.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 System ERP Login Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
        <h2>💡 How System-Level ERP Login Works</h2>
        <p><strong>Instead of individual user credentials, we use:</strong></p>
        <ul>
          <li>✅ <strong>ERPNext API Key/Secret</strong> - Your existing credentials</li>
          <li>✅ <strong>System Administrator Account</strong> - Admin access to ERP</li>
          <li>✅ <strong>One Session for All Users</strong> - No individual passwords needed</li>
        </ul>
        <p><strong>This solves the 403 Forbidden error because:</strong></p>
        <ul>
          <li>🔐 We authenticate with ERP using system credentials</li>
          <li>👥 We create a session that works for all users</li>
          <li>🍪 We generate valid ERP cookies for Raven</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleTestSystemLogin}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          {isLoading ? '🔄 Testing...' : '🔧 Test System ERP Login'}
        </button>
        
        <button
          onClick={handleClearData}
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
          🗑️ Clear All Data
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>📊 Test Results</h2>
          {testResults.map((test, index) => (
            <div
              key={index}
              style={{
                marginBottom: '10px',
                padding: '15px',
                borderRadius: '4px',
                backgroundColor: test.status === 'success' ? '#d4edda' : '#f8d7da',
                border: `1px solid ${test.status === 'success' ? '#c3e6cb' : '#f5c6cb'}`
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: test.status === 'success' ? '#155724' : '#721c24' }}>
                {test.status === 'success' ? '✅' : '❌'} {test.name}
              </h3>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{test.message}</p>
              {test.details && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Details</summary>
                  <pre style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>📊 Current ERP Data</h2>
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
        <h2>🔧 Environment Variables Needed</h2>
        <p>Make sure these are set in your <code>.env.local</code> file:</p>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
{`ERPNEXT_URL=https://erp.elbrit.org
ERPNEXT_API_KEY=your_api_key
ERPNEXT_API_SECRET=your_api_secret
ERP_ADMIN_PASSWORD=admin_password`}
        </pre>
      </div>
    </div>
  );
}
