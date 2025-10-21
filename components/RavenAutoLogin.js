import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getStoredERPData } from './utils/erpBackgroundLogin';
import { 
  buildRavenUrlWithCookieAuth, 
  validateERPCookieData,
  extractUserInfoFromCookies
} from './utils/erpCookieAuth';

/**
 * RavenAutoLogin Component - Enhanced auto-login for Raven using ERP Cookie Data
 * 
 * This component:
 * 1. Uses ERP cookie data for authentication (shared domain with Raven)
 * 2. Extracts user information from ERP cookies (full_name, user_id, sid, etc.)
 * 3. Builds authenticated Raven URL with cookie-based auth parameters
 * 4. Handles both iframe and new window approaches
 * 5. Provides better error handling and retry logic
 * 
 * Benefits of using ERP cookies:
 * - Both Raven and ERP share the same cookie domain (.elbrit.org)
 * - No need to pass sensitive authentication tokens in URLs
 * - More secure as cookies are automatically sent by the browser
 * - Ensures user is properly authenticated in both systems
 */
const RavenAutoLogin = ({ 
  ravenUrl = "https://erp.elbrit.org/raven",
  height = "90vh",
  width = "100%",
  showLoading = true,
  onLoad = null,
  onError = null,
  className = "",
  style = {},
  mode = "iframe" // "iframe" or "window"
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [iframeUrl, setIframeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStep, setAuthStep] = useState('initializing');
  const [ravenWindow, setRavenWindow] = useState(null);

  // Get authentication data from stored ERP data
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Get stored ERP data from localStorage
      const storedERPData = getStoredERPData();
      
      if (!storedERPData) {
        console.warn('⚠️ No stored ERP data available');
        return null;
      }

      const { erpnextData, cookieData, loginData } = storedERPData;

      // Validate cookie data
      if (!validateERPCookieData(cookieData)) {
        console.warn('⚠️ Stored ERP cookie data is invalid');
        return null;
      }

      // Extract user information from stored cookies
      const userInfo = extractUserInfoFromCookies(cookieData);
      
      console.log('🍪 Stored ERP Auth Data:', {
        hasStoredData: !!storedERPData,
        hasCookieData: !!cookieData,
        hasERPNextData: !!erpnextData,
        userInfo,
        cookieKeys: Object.keys(cookieData)
      });
      
      return {
        erpnextData,
        cookieData,
        loginData,
        userInfo: userInfo,
        email: userInfo?.email,
        fullName: userInfo?.fullName,
        userId: userInfo?.userId,
        sessionId: userInfo?.sessionId,
        systemUser: userInfo?.systemUser
      };
    } catch (error) {
      console.error('❌ Error reading stored ERP data:', error);
      return null;
    }
  }, []);

  // Enhanced authentication using stored ERP data
  const authenticateWithRaven = useCallback(async (authData) => {
    try {
      setAuthStep('authenticating');
      console.log('🔐 Starting Raven authentication with stored ERP data...');

      // Check if we have stored ERP data
      if (!authData || !authData.cookieData) {
        console.warn('⚠️ No stored ERP data available for Raven authentication');
        throw new Error('No stored ERP data available');
      }

      // Build Raven URL using stored ERP cookie data
      const authenticatedUrl = buildRavenUrlWithCookieAuth(ravenUrl, authData.cookieData);
      
      console.log('✅ Built Raven URL with stored ERP data');
      console.log('🍪 Using stored ERP data:', {
        user_id: authData.userId,
        full_name: authData.fullName,
        system_user: authData.systemUser,
        session_id: authData.sessionId ? 'available' : 'missing',
        hasERPNextToken: !!authData.erpnextData?.token
      });

      return authenticatedUrl;

    } catch (error) {
      console.error('❌ Stored ERP data authentication error:', error);
      throw error;
    }
  }, [ravenUrl]);

  // Initialize Raven with enhanced authentication
  useEffect(() => {
    const initializeRaven = async () => {
      if (authLoading) {
        console.log('⏳ Waiting for authentication to load...');
        return;
      }

      if (!isAuthenticated) {
        console.warn('⚠️ User not authenticated, redirecting to Raven login');
        setIframeUrl(`${ravenUrl}/login`);
        setIsLoading(false);
        setAuthStep('ready');
        return;
      }

      console.log('🔐 User authenticated, initializing Raven with ERP cookie auto-login...');
      const authData = getAuthData();
      
      if (!authData) {
        console.error('❌ No stored ERP data found');
        setError('Stored ERP authentication data not found. Please log in again to refresh ERP data.');
        setIsLoading(false);
        setAuthStep('error');
        return;
      }

      try {
        setAuthStep('authenticating');
        const url = await authenticateWithRaven(authData);
        setIframeUrl(url);
        setIsLoading(false);
        setAuthStep('ready');
      } catch (error) {
        console.error('❌ Error initializing Raven with stored ERP data:', error);
        setError('Failed to authenticate with Raven using stored ERP data. Please log in again to refresh ERP data.');
        setIsLoading(false);
        setAuthStep('error');
      }
    };

    initializeRaven();
  }, [authLoading, isAuthenticated, getAuthData, authenticateWithRaven, ravenUrl]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('✅ Raven iframe loaded successfully');
    setIsLoading(false);
    setAuthStep('ready');
    if (onLoad) onLoad();
  }, [onLoad]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('❌ Raven iframe failed to load');
    setError('Failed to load Raven chat. Please check your connection.');
    setIsLoading(false);
    setAuthStep('error');
    if (onError) onError();
  }, [onError]);

  // Open in new window
  const openInNewWindow = useCallback(() => {
    if (!iframeUrl) return;

    const newWindow = window.open(
      iframeUrl,
      'raven-chat',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (!newWindow) {
      setError('Popup blocked. Please allow popups for this site.');
      return;
    }

    setRavenWindow(newWindow);
    
    // Check if window is still open
    const checkWindow = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(checkWindow);
        setRavenWindow(null);
        console.log('🪶 Raven window closed');
      }
    }, 1000);
  }, [iframeUrl]);

  // Loading component with step indicator
  const LoadingComponent = () => (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: width,
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}
    >
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
        {authStep === 'initializing' && 'Initializing Raven Chat with ERP Cookies...'}
        {authStep === 'authenticating' && 'Authenticating with ERP Cookie Data...'}
        {authStep === 'ready' && 'Loading Raven Chat...'}
      </p>
      <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
        Step: {authStep}
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
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: width,
        backgroundColor: '#fff5f5',
        borderRadius: '8px',
        border: '1px solid #fed7d7',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div style={{
        fontSize: '24px',
        marginBottom: '12px'
      }}>⚠️</div>
      <p style={{ 
        color: '#e53e3e', 
        fontSize: '14px', 
        margin: '0 0 16px 0',
        lineHeight: '1.4'
      }}>
        {error}
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => window.location.reload()}
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
          Retry
        </button>
        {mode === 'iframe' && (
          <button
            onClick={openInNewWindow}
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
            Open in New Window
          </button>
        )}
      </div>
    </div>
  );

  // Main iframe component
  const IframeComponent = () => (
    <iframe
      src={iframeUrl}
      style={{
        width: width,
        height: height,
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#fff',
        ...style
      }}
      className={className}
      onLoad={handleIframeLoad}
      onError={handleIframeError}
      title="Raven Chat"
      allow="camera; microphone; clipboard-read; clipboard-write"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
    />
  );

  // Render based on state
  if (error) {
    return <ErrorComponent />;
  }

  if (showLoading && (isLoading || !iframeUrl)) {
    return <LoadingComponent />;
  }

  return <IframeComponent />;
};

export default RavenAutoLogin;
