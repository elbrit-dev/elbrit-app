import React, { useState, useEffect, useCallback } from 'react';
import { 
  getERPCookieData, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable
} from './utils/erpCookieAuth';

/**
 * ERP Login Modal Component
 * 
 * This component:
 * 1. Checks if user is logged into ERP system
 * 2. Shows popup modal for ERP login if not authenticated
 * 3. Stores ERP cookie data in localStorage after successful login
 * 4. Provides seamless integration with Raven components
 */
const ERPLoginModal = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  erpUrl = "https://erp.elbrit.org",
  title = "ERP Login Required",
  description = "Please log in to the ERP system to access Raven chat."
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginStep, setLoginStep] = useState('checking');
  const [erpWindow, setErpWindow] = useState(null);
  const [checkInterval, setCheckInterval] = useState(null);

  // Check ERP login status
  const checkERPLoginStatus = useCallback(() => {
    try {
      const isLoggedIn = isERPCookieAuthAvailable();
      const cookieData = getERPCookieData();
      const userInfo = extractUserInfoFromCookies(cookieData);

      console.log('🔍 ERP Login Status Check:', {
        isLoggedIn,
        hasCookieData: !!cookieData,
        userInfo: userInfo ? {
          fullName: userInfo.fullName,
          email: userInfo.email,
          systemUser: userInfo.systemUser
        } : null
      });

      if (isLoggedIn && cookieData && userInfo) {
        // Store ERP data in localStorage for future use
        try {
          localStorage.setItem('erpCookieData', JSON.stringify(cookieData));
          localStorage.setItem('erpUserInfo', JSON.stringify(userInfo));
          localStorage.setItem('erpLoginTime', new Date().toISOString());
          console.log('✅ ERP data stored in localStorage');
        } catch (storageError) {
          console.warn('⚠️ Could not store ERP data in localStorage:', storageError);
        }

        setLoginStep('success');
        setIsLoading(false);
        
        // Call success callback after a short delay
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess({
              cookieData,
              userInfo,
              loginTime: new Date().toISOString()
            });
          }
        }, 1000);

        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking ERP login status:', error);
      setError('Failed to check ERP login status');
      return false;
    }
  }, [onLoginSuccess]);

  // Open ERP login in popup window
  const openERPLogin = useCallback(() => {
    try {
      setLoginStep('opening');
      setIsLoading(true);
      setError(null);

      // Open ERP login in popup window
      const popup = window.open(
        erpUrl,
        'erp-login',
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );

      if (!popup) {
        setError('Popup blocked. Please allow popups for this site and try again.');
        setIsLoading(false);
        setLoginStep('error');
        return;
      }

      setErpWindow(popup);
      setLoginStep('waiting');

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setErpWindow(null);
          setIsLoading(false);
          setLoginStep('checking');
          console.log('🪟 ERP login popup closed by user');
        }
      }, 1000);

      // Check for ERP login success periodically
      const checkLogin = setInterval(() => {
        try {
          // Try to access popup's cookies (this will fail if cross-origin)
          // Instead, we'll check our own cookies which should be updated
          if (checkERPLoginStatus()) {
            clearInterval(checkLogin);
            clearInterval(checkClosed);
            popup.close();
            setErpWindow(null);
          }
        } catch (error) {
          // Expected error due to cross-origin restrictions
          // Continue checking
        }
      }, 2000);

      setCheckInterval(checkLogin);

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(checkLogin);
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        setErpWindow(null);
        setIsLoading(false);
        if (loginStep === 'waiting') {
          setError('Login timeout. Please try again.');
          setLoginStep('error');
        }
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('❌ Error opening ERP login:', error);
      setError('Failed to open ERP login. Please try again.');
      setIsLoading(false);
      setLoginStep('error');
    }
  }, [erpUrl, checkERPLoginStatus, loginStep]);

  // Initial check when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoginStep('checking');
      setIsLoading(true);
      setError(null);

      // Check if already logged in
      if (checkERPLoginStatus()) {
        return;
      }

      // If not logged in, show login option
      setLoginStep('ready');
      setIsLoading(false);
    }
  }, [isOpen, checkERPLoginStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (erpWindow && !erpWindow.closed) {
        erpWindow.close();
      }
    };
  }, [checkInterval, erpWindow]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
    if (erpWindow && !erpWindow.closed) {
      erpWindow.close();
    }
    setErpWindow(null);
    setIsLoading(false);
    setError(null);
    setLoginStep('checking');
    if (onClose) onClose();
  }, [checkInterval, erpWindow, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
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
            color: '#666',
            padding: '5px'
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{description}</p>
        </div>

        {/* Content based on step */}
        {loginStep === 'checking' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: '#666', margin: 0 }}>Checking ERP login status...</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {loginStep === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              You need to log in to the ERP system to access Raven chat.
            </p>
            <button
              onClick={openERPLogin}
              disabled={isLoading}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                marginRight: '10px'
              }}
            >
              {isLoading ? 'Opening...' : 'Login to ERP'}
            </button>
            <button
              onClick={handleClose}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {loginStep === 'opening' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: '#666', margin: 0 }}>Opening ERP login window...</p>
          </div>
        )}

        {loginStep === 'waiting' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #28a745',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: '#666', margin: '0 0 10px 0' }}>
              Please complete the login in the popup window...
            </p>
            <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
              The popup will close automatically when login is complete.
            </p>
          </div>
        )}

        {loginStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <p style={{ color: '#28a745', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              ERP Login Successful!
            </p>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
              You can now access Raven chat. This window will close automatically.
            </p>
          </div>
        )}

        {loginStep === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <p style={{ color: '#dc3545', margin: '0 0 20px 0', fontWeight: 'bold' }}>
              Login Failed
            </p>
            <p style={{ color: '#666', margin: '0 0 20px 0' }}>
              {error || 'An error occurred during login. Please try again.'}
            </p>
            <button
              onClick={() => {
                setError(null);
                setLoginStep('ready');
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERPLoginModal;
