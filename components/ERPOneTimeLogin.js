import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * ERP One-Time Login Popup Component
 * 
 * This component shows a popup modal for ERP login only on the first visit.
 * After the user logs in once, their credentials are stored permanently
 * and used for all future Raven chat sessions.
 */
export default function ERPOneTimeLogin({ onLoginSuccess, onSkip }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [error, setError] = useState('');
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  useEffect(() => {
    // Check if user has already logged into ERP before
    checkExistingERPCredentials();
  }, [user]);

  const checkExistingERPCredentials = () => {
    if (!user) return;

    // Check if user already has stored ERP credentials
    const storedERPData = localStorage.getItem('erpOneTimeLoginData');
    if (storedERPData) {
      try {
        const data = JSON.parse(storedERPData);
        if (data.userId === user.uid && data.erpCredentials) {
          setHasStoredCredentials(true);
          console.log('✅ User already has stored ERP credentials');
          return;
        }
      } catch (error) {
        console.warn('⚠️ Error parsing stored ERP data:', error);
      }
    }

    // If no stored credentials, show the popup
    setIsVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleERPLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting ERP one-time login...');

      // Try to login to ERP system
      const loginResponse = await fetch('https://erp.elbrit.org/api/method/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          usr: loginData.email,
          pwd: loginData.password,
          device: 'web'
        })
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        
        if (loginResult.message === 'Logged In') {
          console.log('✅ ERP login successful!');
          
          // Store ERP credentials permanently
          const erpCredentials = {
            email: loginData.email,
            password: loginData.password, // Store password for future use
            sessionId: loginResult.message?.session_id || `erp_${Date.now()}`,
            loginTime: new Date().toISOString(),
            rememberMe: loginData.rememberMe
          };

          // Store in localStorage with user ID
          const storedData = {
            userId: user.uid,
            userEmail: user.email,
            erpCredentials: erpCredentials,
            lastUsed: new Date().toISOString()
          };

          localStorage.setItem('erpOneTimeLoginData', JSON.stringify(storedData));
          
          console.log('💾 ERP credentials stored permanently');
          
          // Close popup and notify success
          setIsVisible(false);
          onLoginSuccess?.(erpCredentials);
          
        } else {
          throw new Error(loginResult.message || 'Login failed');
        }
      } else {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${loginResponse.status}`);
      }
    } catch (error) {
      console.error('❌ ERP login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ User skipped ERP login');
    setIsVisible(false);
    onSkip?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    onSkip?.();
  };

  // Don't show popup if user already has stored credentials
  if (hasStoredCredentials) {
    return null;
  }

  // Don't show popup if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
            🔐 ERP Login Required
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Please log into your ERP account once. We'll remember your credentials for future use.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleERPLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              ERP Email *
            </label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleInputChange}
              placeholder="your.email@company.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              ERP Password *
            </label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
              placeholder="Your ERP password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#333' }}>
                Remember my credentials for future use
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '🔄 Logging in...' : '🔐 Login to ERP'}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ⏭️ Skip
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            This is a one-time setup. Your credentials will be stored securely.
          </p>
        </div>
      </div>
    </div>
  );
}
