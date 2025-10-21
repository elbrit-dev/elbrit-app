import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { storeERPCredentials } from './utils/erpOneTimeCredentials';

/**
 * ERP One-Time Login Popup Component
 * 
 * This component shows a popup modal with the actual ERP login page (erp.elbrit.org)
 * for one-time login. After the user logs in once, their session is detected
 * and used for all future Raven chat sessions.
 */
export default function ERPOneTimeLogin({ onLoginSuccess, onSkip }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [loginStatus, setLoginStatus] = useState('waiting'); // waiting, checking, success, error

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

  // Check if user is logged into ERP by polling the ERP system
  const checkERPLoginStatus = async () => {
    try {
      setLoginStatus('checking');
      
      // Check if user is logged into ERP by making a request
      const response = await fetch('https://erp.elbrit.org/api/method/frappe.auth.get_logged_user', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.message && userData.message !== 'Guest') {
          console.log('✅ User is logged into ERP system:', userData.message);
          
          // Extract ERP cookies from the browser
          const erpCookies = extractERPCookies();
          
          if (erpCookies && erpCookies.sid && erpCookies.user_id) {
            // Store the ERP session data
            const erpCredentials = {
              email: erpCookies.user_id,
              sessionId: erpCookies.sid,
              fullName: erpCookies.full_name,
              loginTime: new Date().toISOString(),
              rememberMe: true
            };

            // Store in localStorage
            storeERPCredentials(user, erpCredentials);
            
            console.log('💾 ERP session stored permanently');
            setLoginStatus('success');
            
            // Close popup and notify success
            setTimeout(() => {
              setIsVisible(false);
              onLoginSuccess?.(erpCredentials);
            }, 1000);
            
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Error checking ERP login status:', error);
      return false;
    }
  };

  // Extract ERP cookies from the browser
  const extractERPCookies = () => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    // Check for ERP-specific cookies
    const erpCookies = {};
    const erpCookieNames = ['sid', 'user_id', 'full_name', 'system_user', 'user_image'];
    
    erpCookieNames.forEach(name => {
      if (cookies[name]) {
        erpCookies[name] = cookies[name];
      }
    });

    return Object.keys(erpCookies).length > 0 ? erpCookies : null;
  };

  // Poll for ERP login status every 2 seconds
  useEffect(() => {
    if (!isVisible || hasStoredCredentials) return;

    const interval = setInterval(async () => {
      const isLoggedIn = await checkERPLoginStatus();
      if (isLoggedIn) {
        clearInterval(interval);
      }
    }, 2000);

    // Cleanup interval after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (loginStatus === 'waiting' || loginStatus === 'checking') {
        setError('Login timeout. Please try again.');
        setLoginStatus('error');
      }
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isVisible, hasStoredCredentials, loginStatus]);

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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        height: '80%',
        maxHeight: '600px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>
              🔐 ERP Login Required
            </h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Please log into your ERP account. This is a one-time setup.
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        {/* Status indicator */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: loginStatus === 'success' ? '#d4edda' : 
                          loginStatus === 'error' ? '#f8d7da' : '#fff3cd',
          borderBottom: '1px solid #eee'
        }}>
          {loginStatus === 'waiting' && (
            <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
              ⏳ Please log in to your ERP account in the window below...
            </p>
          )}
          {loginStatus === 'checking' && (
            <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
              🔍 Checking login status...
            </p>
          )}
          {loginStatus === 'success' && (
            <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
              ✅ Login successful! Closing popup...
            </p>
          )}
          {loginStatus === 'error' && (
            <p style={{ margin: 0, color: '#721c24', fontSize: '14px' }}>
              ❌ {error || 'Login failed. Please try again.'}
            </p>
          )}
        </div>

        {/* ERP Login iframe */}
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe
            src="https://erp.elbrit.org/login"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '0 0 12px 12px'
            }}
            title="ERP Login"
            allow="camera; microphone; clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            After logging in, this popup will close automatically and Raven chat will load.
          </p>
          <button
            onClick={handleSkip}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ⏭️ Skip
          </button>
        </div>
      </div>
    </div>
  );
}
