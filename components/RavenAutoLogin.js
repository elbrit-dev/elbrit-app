import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import ERPLoginHandler from './ERPLoginHandler';
import { 
  getERPCookieData, 
  getStoredERPCookieData,
  buildRavenUrlWithCookieAuth, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable
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

  // Get authentication data from ERP cookies (with fallback to stored data)
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      // First try to get fresh ERP cookie data
      let erpCookieData = getERPCookieData();
      
      // If no fresh data, try stored data
      if (!erpCookieData) {
        console.log('📦 No fresh ERP cookie data, trying stored data...');
        erpCookieData = getStoredERPCookieData();
      }
      
      if (!erpCookieData) {
        console.warn('⚠️ No ERP cookie data available (fresh or stored)');
        return null;
      }

      // Validate cookie data
      if (!validateERPCookieData(erpCookieData)) {
        console.warn('⚠️ ERP cookie data is invalid');
        return null;
      }

      // Extract user information from cookies
      const userInfo = extractUserInfoFromCookies(erpCookieData);
      
      console.log('🍪 ERP Cookie Auth Data:', {
        hasCookieData: !!erpCookieData,
        userInfo,
        cookieKeys: Object.keys(erpCookieData),
        dataSource: erpCookieData.lastUpdated ? 'fresh' : 'stored'
      });
      
      return {
        cookieData: erpCookieData,
        userInfo: userInfo,
        email: userInfo?.email,
        fullName: userInfo?.fullName,
        userId: userInfo?.userId,
        sessionId: userInfo?.sessionId,
        systemUser: userInfo?.systemUser
      };
    } catch (error) {
      console.error('❌ Error reading ERP cookie data:', error);
      return null;
    }
  }, []);

  // Enhanced authentication using ERP cookie data
  const authenticateWithRaven = useCallback(async (authData) => {
    try {
      setAuthStep('authenticating');
      console.log('🔐 Starting Raven authentication with ERP cookies...');

      // Check if ERP cookie authentication is available
      if (!isERPCookieAuthAvailable()) {
        console.warn('⚠️ ERP cookie authentication not available');
        throw new Error('ERP cookie authentication not available');
      }

      // Build Raven URL using ERP cookie data
      const authenticatedUrl = buildRavenUrlWithCookieAuth(ravenUrl, authData.cookieData);
      
      console.log('✅ Built Raven URL with ERP cookie authentication');
      console.log('🍪 Using ERP cookie data:', {
        user_id: authData.userId,
        full_name: authData.fullName,
        system_user: authData.systemUser,
        session_id: authData.sessionId ? 'available' : 'missing'
      });

      return authenticatedUrl;

    } catch (error) {
      console.error('❌ ERP cookie authentication error:', error);
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
        console.error('❌ No ERP cookie data found');
        setError('ERP authentication data not found. Please ensure you are logged into ERP system.');
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
        console.error('❌ Error initializing Raven with ERP cookies:', error);
        setError('Failed to authenticate with Raven using ERP cookies. Please ensure you are logged into ERP system.');
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
      allow="camera; microphone; notifications; clipboard-read; clipboard-write"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
    />
  );

  // Main Raven component
  const RavenComponent = () => {
    // Render based on state
    if (error) {
      return <ErrorComponent />;
    }

    if (showLoading && (isLoading || !iframeUrl)) {
      return <LoadingComponent />;
    }

    return <IframeComponent />;
  };

  // Wrap with ERP Login Handler
  return (
    <ERPLoginHandler
      onERPLoginSuccess={(cookieData, userInfo) => {
        console.log('✅ ERP login successful, initializing Raven...');
        // Re-initialize Raven when ERP login is successful
        const authData = getAuthData();
        if (authData) {
          authenticateWithRaven(authData).then(url => {
            setIframeUrl(url);
            setIsLoading(false);
            setAuthStep('ready');
          }).catch(err => {
            console.error('❌ Error initializing Raven after ERP login:', err);
            setError('Failed to initialize Raven after ERP login');
            setIsLoading(false);
            setAuthStep('error');
          });
        }
      }}
      onERPLoginError={(error) => {
        console.error('❌ ERP login error:', error);
        setError('Background ERP login failed. Will retry automatically.');
        setIsLoading(false);
        setAuthStep('error');
      }}
      enableBackgroundLogin={true}
      showLoading={false}
    >
      <RavenComponent />
    </ERPLoginHandler>
  );
};

export default RavenAutoLogin;
