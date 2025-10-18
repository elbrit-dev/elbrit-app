import React, { useState, useEffect, useCallback } from 'react';
import { 
  isUserLoggedIntoERP, 
  getERPCookieData, 
  getStoredERPCookieData,
  redirectToERPLogin,
  isERPCookieAuthAvailable 
} from './utils/erpCookieAuth';

/**
 * ERP Login Handler Component
 * 
 * This component:
 * 1. Checks if user is logged into erp.elbrit.org
 * 2. Redirects to ERP login if not logged in
 * 3. Stores ERP cookie data in localStorage
 * 4. Provides loading states and error handling
 */
const ERPLoginHandler = ({ 
  children, 
  onERPLoginSuccess = null,
  onERPLoginError = null,
  redirectToLogin = true,
  showLoading = true
}) => {
  const [erpLoginStatus, setErpLoginStatus] = useState('checking');
  const [erpCookieData, setErpCookieData] = useState(null);
  const [error, setError] = useState(null);

  // Check ERP login status
  const checkERPLoginStatus = useCallback(() => {
    try {
      console.log('🔍 Checking ERP login status...');
      
      // Check if user is logged into ERP
      const isLoggedIn = isUserLoggedIntoERP();
      
      if (isLoggedIn) {
        console.log('✅ User is logged into ERP');
        
        // Get ERP cookie data and store it
        const cookieData = getERPCookieData();
        
        if (cookieData) {
          setErpCookieData(cookieData);
          setErpLoginStatus('logged_in');
          
          if (onERPLoginSuccess) {
            onERPLoginSuccess(cookieData);
          }
        } else {
          console.warn('⚠️ User logged into ERP but no cookie data found');
          setErpLoginStatus('no_cookies');
          setError('ERP login detected but cookie data not available');
        }
      } else {
        console.log('❌ User not logged into ERP');
        setErpLoginStatus('not_logged_in');
        
        // Try to get stored cookie data as fallback
        const storedData = getStoredERPCookieData();
        if (storedData) {
          console.log('📦 Found stored ERP cookie data, using fallback');
          setErpCookieData(storedData);
          setErpLoginStatus('using_stored');
        } else {
          console.log('🔄 No stored data, need to redirect to ERP login');
          setError('Please log into ERP system first');
          
          // Auto-redirect to ERP login if enabled
          if (redirectToLogin) {
            setTimeout(() => {
              redirectToERPLogin(window.location.href);
            }, 2000); // Give user 2 seconds to see the message
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking ERP login status:', error);
      setError('Failed to check ERP login status');
      setErpLoginStatus('error');
      
      if (onERPLoginError) {
        onERPLoginError(error);
      }
    }
  }, [onERPLoginSuccess, onERPLoginError, redirectToLogin]);

  // Initial check
  useEffect(() => {
    checkERPLoginStatus();
  }, [checkERPLoginStatus]);

  // Periodic check for ERP login status changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (erpLoginStatus === 'not_logged_in' || erpLoginStatus === 'no_cookies') {
        checkERPLoginStatus();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [erpLoginStatus, checkERPLoginStatus]);

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
      {redirectToLogin && (
        <div>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 16px 0' }}>
            Redirecting to ERP login in a few seconds...
          </p>
          <button
            onClick={() => redirectToERPLogin(window.location.href)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go to ERP Login Now
          </button>
        </div>
      )}
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
      {erpCookieData && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <p>User: {erpCookieData.full_name || 'Unknown'}</p>
          <p>ID: {erpCookieData.user_id || 'Unknown'}</p>
        </div>
      )}
    </div>
  );

  // Render based on status
  if (showLoading && erpLoginStatus === 'checking') {
    return <LoadingComponent />;
  }

  if (erpLoginStatus === 'error' || erpLoginStatus === 'not_logged_in') {
    return <ErrorComponent />;
  }

  if (erpLoginStatus === 'logged_in' || erpLoginStatus === 'using_stored') {
    return (
      <div>
        <SuccessComponent />
        {children}
      </div>
    );
  }

  // Default fallback
  return <ErrorComponent />;
};

export default ERPLoginHandler;
