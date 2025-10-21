import React, { useState, useEffect, useCallback } from 'react';
import { 
  getERPCookieData, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable
} from './utils/erpCookieAuth';

/**
 * ERP Login Component - Handles ERP system login and cookie storage
 * 
 * This component:
 * 1. Provides ERP login functionality
 * 2. Monitors ERP cookie data after login
 * 3. Stores ERP cookie data in localStorage for other components
 * 4. Provides login status and user information
 * 
 * Usage:
 * - Use this component to ensure user is logged into ERP first
 * - After successful login, cookie data is stored in localStorage
 * - Other components can then use the stored data for authentication
 */
const ERPLogin = ({ 
  erpUrl = "https://erp.elbrit.org",
  onLoginSuccess = null,
  onLoginError = null,
  showStatus = true,
  autoCheck = true,
  className = "",
  style = {}
}) => {
  const [loginStatus, setLoginStatus] = useState('checking'); // 'checking', 'logged_in', 'not_logged_in', 'error'
  const [userInfo, setUserInfo] = useState(null);
  const [cookieData, setCookieData] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  // Check ERP login status and store cookie data
  const checkERPLogin = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setIsChecking(true);
    setError(null);

    try {
      console.log('🔍 Checking ERP login status...');

      // Get ERP cookie data
      const erpCookies = getERPCookieData();
      
      if (!erpCookies) {
        console.log('⚠️ No ERP cookies found');
        setLoginStatus('not_logged_in');
        setUserInfo(null);
        setCookieData(null);
        return;
      }

      // Validate cookie data
      const isValid = validateERPCookieData(erpCookies);
      
      if (!isValid) {
        console.log('⚠️ ERP cookies are invalid');
        setLoginStatus('not_logged_in');
        setUserInfo(null);
        setCookieData(null);
        return;
      }

      // Extract user information
      const user = extractUserInfoFromCookies(erpCookies);
      
      if (!user) {
        console.log('⚠️ Could not extract user info from cookies');
        setLoginStatus('not_logged_in');
        setUserInfo(null);
        setCookieData(null);
        return;
      }

      // Store cookie data in localStorage
      try {
        localStorage.setItem('erpCookieData', JSON.stringify(erpCookies));
        localStorage.setItem('erpUserInfo', JSON.stringify(user));
        localStorage.setItem('erpLoginTime', new Date().toISOString());
        console.log('✅ ERP cookie data stored in localStorage');
      } catch (storageError) {
        console.warn('⚠️ Could not store ERP data in localStorage:', storageError);
      }

      // Update state
      setLoginStatus('logged_in');
      setUserInfo(user);
      setCookieData(erpCookies);
      
      console.log('✅ ERP login verified:', {
        fullName: user.fullName,
        userId: user.userId,
        systemUser: user.systemUser
      });

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess({ user, cookies: erpCookies });
      }

    } catch (error) {
      console.error('❌ Error checking ERP login:', error);
      setError(error.message);
      setLoginStatus('error');
      setUserInfo(null);
      setCookieData(null);
      
      if (onLoginError) {
        onLoginError(error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [onLoginSuccess, onLoginError]);

  // Auto-check ERP login status
  useEffect(() => {
    if (autoCheck) {
      checkERPLogin();
    }
  }, [autoCheck, checkERPLogin]);

  // Monitor cookie changes
  useEffect(() => {
    if (!autoCheck) return;

    const interval = setInterval(() => {
      checkERPLogin();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoCheck, checkERPLogin]);

  // Handle manual ERP login
  const handleERPLogin = useCallback(() => {
    console.log('🔐 Redirecting to ERP login...');
    window.open(erpUrl, '_blank');
    
    // Check login status after a delay
    setTimeout(() => {
      checkERPLogin();
    }, 3000);
  }, [erpUrl, checkERPLogin]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    checkERPLogin();
  }, [checkERPLogin]);

  // Loading component
  const LoadingComponent = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      ...style
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '10px'
      }} />
      <span>Checking ERP login status...</span>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Not logged in component
  const NotLoggedInComponent = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      textAlign: 'center',
      ...style
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Not Logged into ERP</h3>
      <p style={{ margin: '0 0 15px 0', color: '#856404' }}>
        You need to be logged into the ERP system to use Raven chat.
      </p>
      <button
        onClick={handleERPLogin}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          marginRight: '10px'
        }}
      >
        Login to ERP
      </button>
      <button
        onClick={handleRefresh}
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Refresh Status
      </button>
    </div>
  );

  // Logged in component
  const LoggedInComponent = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '8px',
      ...style
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ ERP Login Verified</h3>
      {userInfo && (
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '5px 0', color: '#155724' }}>
            <strong>Name:</strong> {userInfo.fullName}
          </p>
          <p style={{ margin: '5px 0', color: '#155724' }}>
            <strong>Email:</strong> {userInfo.userId}
          </p>
          <p style={{ margin: '5px 0', color: '#155724' }}>
            <strong>System User:</strong> {userInfo.systemUser ? 'Yes' : 'No'}
          </p>
        </div>
      )}
      <button
        onClick={handleRefresh}
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
        Refresh Status
      </button>
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '8px',
      textAlign: 'center',
      ...style
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ Error Checking ERP Status</h3>
      <p style={{ margin: '0 0 15px 0', color: '#721c24' }}>
        {error || 'An error occurred while checking ERP login status.'}
      </p>
      <button
        onClick={handleRefresh}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Retry
      </button>
    </div>
  );

  // Don't render anything if showStatus is false
  if (!showStatus) {
    return null;
  }

  // Render based on status
  if (isChecking) {
    return <LoadingComponent />;
  }

  if (loginStatus === 'error') {
    return <ErrorComponent />;
  }

  if (loginStatus === 'not_logged_in') {
    return <NotLoggedInComponent />;
  }

  if (loginStatus === 'logged_in') {
    return <LoggedInComponent />;
  }

  return <LoadingComponent />;
};

export default ERPLogin;
