import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  isUserLoggedIntoERP, 
  getERPCookieData, 
  getStoredERPCookieData,
  validateERPCookieData,
  extractUserInfoFromCookies
} from './utils/erpCookieAuth';

/**
 * Background ERP Login Component
 * 
 * This component handles ERP login in the background using a hidden iframe.
 * It doesn't redirect the user away from the current site - everything happens
 * behind the scenes while the user continues using the app.
 */
const BackgroundERPLogin = ({ 
  onERPLoginSuccess = null,
  onERPLoginError = null,
  checkInterval = 5000, // Check every 5 seconds
  maxRetries = 3
}) => {
  const [loginStatus, setLoginStatus] = useState('checking'); // checking, logged_in, not_logged_in, login_in_progress, error
  const [retryCount, setRetryCount] = useState(0);
  const [cookieData, setCookieData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const iframeRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Check ERP login status
  const checkERPLoginStatus = useCallback(() => {
    try {
      console.log('🔍 Background ERP Login - Checking status...');
      
      // Check if user is logged into ERP
      const isLoggedIn = isUserLoggedIntoERP();
      
      if (isLoggedIn) {
        console.log('✅ Background ERP Login - User is logged in');
        
        // Get ERP cookie data
        let erpCookieData = getERPCookieData();
        
        // If no fresh data, try stored data
        if (!erpCookieData) {
          console.log('📦 Background ERP Login - Using stored cookie data');
          erpCookieData = getStoredERPCookieData();
        }
        
        if (erpCookieData && validateERPCookieData(erpCookieData)) {
          const extractedUserInfo = extractUserInfoFromCookies(erpCookieData);
          
          setCookieData(erpCookieData);
          setUserInfo(extractedUserInfo);
          setLoginStatus('logged_in');
          setRetryCount(0);
          
          if (onERPLoginSuccess) {
            onERPLoginSuccess(erpCookieData, extractedUserInfo);
          }
          
          return;
        }
      }
      
      // If not logged in or no valid cookie data
      console.log('❌ Background ERP Login - User not logged in or no valid cookies');
      setLoginStatus('not_logged_in');
      
      // Try stored data as fallback
      const storedData = getStoredERPCookieData();
      if (storedData && validateERPCookieData(storedData)) {
        console.log('📦 Background ERP Login - Using stored data as fallback');
        const extractedUserInfo = extractUserInfoFromCookies(storedData);
        
        setCookieData(storedData);
        setUserInfo(extractedUserInfo);
        setLoginStatus('logged_in');
        
        if (onERPLoginSuccess) {
          onERPLoginSuccess(storedData, extractedUserInfo);
        }
      }
      
    } catch (error) {
      console.error('❌ Background ERP Login - Error checking status:', error);
      setLoginStatus('error');
      
      if (onERPLoginError) {
        onERPLoginError(error);
      }
    }
  }, [onERPLoginSuccess, onERPLoginError]);

  // Start background ERP login process
  const startBackgroundLogin = useCallback(() => {
    if (retryCount >= maxRetries) {
      console.log('❌ Background ERP Login - Max retries reached');
      setLoginStatus('error');
      return;
    }

    console.log('🔄 Background ERP Login - Starting background login process...');
    setLoginStatus('login_in_progress');
    setRetryCount(prev => prev + 1);

    // Create hidden iframe for ERP login
    if (iframeRef.current) {
      iframeRef.current.src = 'https://erp.elbrit.org/login';
    }
  }, [retryCount, maxRetries]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('📱 Background ERP Login - Iframe loaded');
    
    // After iframe loads, start checking for cookies
    setTimeout(() => {
      checkERPLoginStatus();
    }, 2000); // Wait 2 seconds for cookies to be set
  }, [checkERPLoginStatus]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('❌ Background ERP Login - Iframe failed to load');
    setLoginStatus('error');
    
    if (onERPLoginError) {
      onERPLoginError(new Error('ERP login iframe failed to load'));
    }
  }, [onERPLoginError]);

  // Initial check
  useEffect(() => {
    checkERPLoginStatus();
  }, [checkERPLoginStatus]);

  // Periodic check for ERP login status
  useEffect(() => {
    if (loginStatus === 'not_logged_in' || loginStatus === 'login_in_progress') {
      checkIntervalRef.current = setInterval(() => {
        checkERPLoginStatus();
      }, checkInterval);
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [loginStatus, checkInterval, checkERPLoginStatus]);

  // Auto-start background login if not logged in
  useEffect(() => {
    if (loginStatus === 'not_logged_in' && retryCount === 0) {
      // Wait a bit before starting background login
      const timer = setTimeout(() => {
        startBackgroundLogin();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loginStatus, retryCount, startBackgroundLogin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ display: 'none' }}>
      {/* Hidden iframe for background ERP login */}
      <iframe
        ref={iframeRef}
        src=""
        style={{
          width: '1px',
          height: '1px',
          border: 'none',
          position: 'absolute',
          top: '-1000px',
          left: '-1000px',
          visibility: 'hidden'
        }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Background ERP Login"
      />
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '200px'
        }}>
          <div>🔄 Background ERP Login</div>
          <div>Status: {loginStatus}</div>
          <div>Retries: {retryCount}/{maxRetries}</div>
          {userInfo && (
            <div>User: {userInfo.fullName}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundERPLogin;
