import React, { useState, useEffect, useCallback } from 'react';
import BackgroundERPLogin from './BackgroundERPLogin';
import { 
  isUserLoggedIntoERP, 
  getERPCookieData, 
  getStoredERPCookieData,
  isERPCookieAuthAvailable 
} from './utils/erpCookieAuth';

/**
 * ERP Login Handler Component
 * 
 * This component:
 * 1. Checks if user is logged into erp.elbrit.org
 * 2. Uses background ERP login process (no redirects)
 * 3. Stores ERP cookie data in localStorage
 * 4. Provides loading states and error handling
 * 
 * The ERP login happens in the background using a hidden iframe,
 * so the user never leaves the current site.
 */
const ERPLoginHandler = ({ 
  children, 
  onERPLoginSuccess = null,
  onERPLoginError = null,
  showLoading = true,
  enableBackgroundLogin = true
}) => {
  const [erpLoginStatus, setErpLoginStatus] = useState('checking');
  const [erpCookieData, setErpCookieData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Handle successful ERP login
  const handleERPLoginSuccess = useCallback((cookieData, extractedUserInfo) => {
    console.log('✅ ERP Login Handler - Login successful');
    setErpCookieData(cookieData);
    setUserInfo(extractedUserInfo);
    setErpLoginStatus('logged_in');
    setError(null);
    
    if (onERPLoginSuccess) {
      onERPLoginSuccess(cookieData, extractedUserInfo);
    }
  }, [onERPLoginSuccess]);

  // Handle ERP login error
  const handleERPLoginError = useCallback((error) => {
    console.error('❌ ERP Login Handler - Login error:', error);
    setError('Background ERP login failed');
    setErpLoginStatus('error');
    
    if (onERPLoginError) {
      onERPLoginError(error);
    }
  }, [onERPLoginError]);

  // Initial check for existing ERP login
  useEffect(() => {
    const checkInitialStatus = () => {
      try {
        console.log('🔍 ERP Login Handler - Initial status check...');
        
        // Check if user is already logged into ERP
        const isLoggedIn = isUserLoggedIntoERP();
        
        if (isLoggedIn) {
          console.log('✅ ERP Login Handler - User already logged into ERP');
          
          // Get ERP cookie data
          let cookieData = getERPCookieData();
          
          // If no fresh data, try stored data
          if (!cookieData) {
            cookieData = getStoredERPCookieData();
          }
          
          if (cookieData) {
            const extractedUserInfo = extractUserInfoFromCookies(cookieData);
            handleERPLoginSuccess(cookieData, extractedUserInfo);
            return;
          }
        }
        
        // Check for stored data as fallback
        const storedData = getStoredERPCookieData();
        if (storedData) {
          console.log('📦 ERP Login Handler - Using stored data as fallback');
          const extractedUserInfo = extractUserInfoFromCookies(storedData);
          handleERPLoginSuccess(storedData, extractedUserInfo);
          return;
        }
        
        console.log('❌ ERP Login Handler - No ERP login found, will start background process');
        setErpLoginStatus('not_logged_in');
        
      } catch (error) {
        console.error('❌ ERP Login Handler - Error in initial check:', error);
        handleERPLoginError(error);
      }
    };

    checkInitialStatus();
  }, [handleERPLoginSuccess, handleERPLoginError]);

  // Loading component
  const LoadingComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }} />
      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>
        Checking ERP login status...
      </p>
      <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
        Status: {erpLoginStatus}
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Background process component
  const BackgroundProcessComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: '#fff3e0',
      borderRadius: '8px',
      border: '1px solid #ffb74d',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
      <p style={{ color: '#e65100', fontSize: '14px', margin: '0 0 8px 0' }}>
        Setting up ERP authentication in background...
      </p>
      <p style={{ color: '#666', fontSize: '12px', margin: '0 0 16px 0' }}>
        This happens automatically without interrupting your workflow
      </p>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #ff9800',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: '#fff5f5',
      borderRadius: '8px',
      border: '1px solid #fed7d7',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ color: '#e53e3e', fontSize: '14px', margin: '0 0 16px 0' }}>
        {error}
      </p>
      <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
        Background ERP login will retry automatically
      </p>
    </div>
  );

  // Success component
  const SuccessComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f0fff4',
      borderRadius: '8px',
      border: '1px solid #9ae6b4',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '12px' }}>✅</div>
      <p style={{ color: '#2d7d32', fontSize: '14px', margin: '0 0 8px 0' }}>
        ERP authentication successful!
      </p>
      <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
        Status: {erpLoginStatus === 'logged_in' ? 'Live ERP session' : 'Using stored data'}
      </p>
      {userInfo && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <p>User: {userInfo.fullName || 'Unknown'}</p>
          <p>ID: {userInfo.userId || 'Unknown'}</p>
        </div>
      )}
    </div>
  );

  // Render based on status
  if (showLoading && erpLoginStatus === 'checking') {
    return <LoadingComponent />;
  }

  if (erpLoginStatus === 'error') {
    return (
      <div>
        <ErrorComponent />
        {enableBackgroundLogin && (
          <BackgroundERPLogin
            onERPLoginSuccess={handleERPLoginSuccess}
            onERPLoginError={handleERPLoginError}
          />
        )}
      </div>
    );
  }

  if (erpLoginStatus === 'not_logged_in') {
    return (
      <div>
        <BackgroundProcessComponent />
        {enableBackgroundLogin && (
          <BackgroundERPLogin
            onERPLoginSuccess={handleERPLoginSuccess}
            onERPLoginError={handleERPLoginError}
          />
        )}
      </div>
    );
  }

  if (erpLoginStatus === 'logged_in') {
    return (
      <div>
        <SuccessComponent />
        {children}
      </div>
    );
  }

  // Default fallback
  return <LoadingComponent />;
};

export default ERPLoginHandler;
