import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getStoredERPData } from './utils/erpBackgroundLogin';
import { 
  buildRavenUrlWithCookieAuth, 
  validateERPCookieData,
  extractUserInfoFromCookies
} from './utils/erpCookieAuth';
import { getStoredERPCredentials, hasStoredERPCredentials, createERPCookieData, validateERPCredentials } from './utils/erpOneTimeCredentials';
import ERPOneTimeLogin from './ERPOneTimeLogin';

/**
 * RavenEmbed Component - Embeds Raven chat application via iframe with ERP Cookie Auto-login
 * 
 * This component:
 * 1. Reads user credentials from ERP cookies (shared domain authentication)
 * 2. Extracts user information from ERP cookie data (full_name, user_id, sid, etc.)
 * 3. Constructs Raven URL with ERP cookie authentication parameters
 * 4. Embeds Raven in an iframe with seamless auto-login
 * 5. Handles loading states and error scenarios
 * 
 * Benefits of using ERP cookies:
 * - Both Raven and ERP share the same cookie domain (.elbrit.org)
 * - No need to pass sensitive authentication tokens in URLs
 * - More secure as cookies are automatically sent by the browser
 * - Ensures user is properly authenticated in both systems
 * 
 * Usage in Plasmic:
 * 1. Register this component in plasmic-init.js
 * 2. Drag and drop "RavenEmbed" component in Plasmic Studio
 * 3. Configure height/width as needed
 */
const RavenEmbed = ({ 
  ravenUrl = "https://erp.elbrit.org/raven",
  height = "90vh",
  width = "100%",
  showLoading = true,
  onLoad = null,
  onError = null,
  className = "",
  style = {}
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [iframeUrl, setIframeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [authStep, setAuthStep] = useState('initializing');
  const [showERPLogin, setShowERPLogin] = useState(false);
  const [erpCredentials, setErpCredentials] = useState(null);
  const maxRetries = 3;

  // Get authentication data - check one-time login first, then fallback to stored ERP data
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      // First, check for one-time ERP login credentials
      const oneTimeCredentials = getStoredERPCredentials(user);
      if (oneTimeCredentials) {
        console.log('✅ Using one-time ERP login credentials for Raven');
        const cookieData = createERPCookieData(user, oneTimeCredentials);
        const userInfo = extractUserInfoFromCookies(cookieData);
        
        return {
          cookieData,
          source: 'one_time_login',
          erpCredentials: oneTimeCredentials,
          userInfo: userInfo,
          email: userInfo?.email,
          fullName: userInfo?.fullName,
          userId: userInfo?.userId,
          sessionId: userInfo?.sessionId,
          systemUser: userInfo?.systemUser
        };
      }

      // Fallback to stored ERP data from background login
      const storedERPData = getStoredERPData();
      if (storedERPData && storedERPData.cookieData) {
        console.log('✅ Using stored ERP background login data for Raven');
        const { erpnextData, cookieData, loginData } = storedERPData;
        const userInfo = extractUserInfoFromCookies(cookieData);
        
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
      }

      console.warn('⚠️ No ERP credentials found - user needs one-time login');
      return null;
    } catch (error) {
      console.error('❌ Error reading stored ERP data for Raven Embed:', error);
      return null;
    }
  }, [user]);

  // Enhanced authentication using stored ERP data
  const buildRavenUrl = useCallback(async (authData) => {
    if (!authData || !authData.cookieData) {
      console.warn('⚠️ No stored ERP data available, redirecting to login');
      return `${ravenUrl}/login`;
    }

    try {
      console.log('🔐 Starting enhanced Raven authentication with stored ERP data...');
      setAuthStep('authenticating');

      // Build Raven URL using stored ERP cookie data
      const authenticatedUrl = buildRavenUrlWithCookieAuth(ravenUrl, authData.cookieData);
      
      console.log('✅ Built enhanced Raven URL with stored ERP data');
      console.log('🍪 Using stored ERP data for Raven Embed:', {
        user_id: authData.userId,
        full_name: authData.fullName,
        system_user: authData.systemUser,
        session_id: authData.sessionId ? 'available' : 'missing',
        hasERPNextToken: !!authData.erpnextData?.token
      });

      return authenticatedUrl;

    } catch (error) {
      console.error('❌ Error in stored ERP data Raven authentication:', error);
      // Fallback to login page
      return `${ravenUrl}/login`;
    }
  }, [ravenUrl]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('✅ Raven iframe loaded successfully');
    setIsLoading(false);
    setError(null);
    if (onLoad) onLoad();
  }, [onLoad]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('❌ Raven iframe failed to load');
    setError('Failed to load Raven chat. Please check your connection.');
    setIsLoading(false);
    if (onError) onError();
  }, [onError]);

  // Handle successful ERP login
  const handleERPLoginSuccess = useCallback(async (credentials) => {
    console.log('✅ ERP login successful, storing credentials and building Raven URL');
    setErpCredentials(credentials);
    setShowERPLogin(false);
    
    // Rebuild the Raven URL with new credentials
    const authData = getAuthData();
    if (authData) {
      try {
        const url = await buildRavenUrl(authData);
        setIframeUrl(url);
        setIsLoading(false);
        setAuthStep('ready');
      } catch (error) {
        console.error('❌ Error building Raven URL after ERP login:', error);
        setError('Failed to build Raven URL after ERP login');
        setAuthStep('error');
      }
    }
  }, [getAuthData, buildRavenUrl]);

  // Handle ERP login skip
  const handleERPLoginSkip = useCallback(() => {
    console.log('⏭️ User skipped ERP login');
    setShowERPLogin(false);
    setError('ERP login required for Raven chat. Please refresh the page to try again.');
    setAuthStep('error');
  }, []);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying Raven load (attempt ${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setError(null);
      
      // Force refresh by updating URL with new timestamp
      const authData = getAuthData();
      const newUrl = buildRavenUrl(authData);
      setIframeUrl(newUrl);
    } else {
      console.error('❌ Max retries reached for Raven iframe');
      setError('Failed to load Raven chat after multiple attempts. Please refresh the page.');
    }
  }, [retryCount, maxRetries, getAuthData, buildRavenUrl]);

  // Initialize iframe URL when auth is ready
  useEffect(() => {
    const initializeRaven = async () => {
      if (authLoading) {
        console.log('⏳ Waiting for authentication to load...');
        setAuthStep('initializing');
        return;
      }

      if (!isAuthenticated) {
        console.warn('⚠️ User not authenticated, redirecting to Raven login');
        setIframeUrl(`${ravenUrl}/login`);
        setIsLoading(false);
        setAuthStep('ready');
        return;
      }

      console.log('🔐 User authenticated, checking for ERP credentials...');
      setAuthStep('initializing');
      const authData = getAuthData();
      
      if (!authData) {
        console.log('⚠️ No ERP credentials found - showing one-time login popup');
        setShowERPLogin(true);
        setIsLoading(false);
        setAuthStep('needs_erp_login');
        return;
      }

      try {
        const url = await buildRavenUrl(authData);
        setIframeUrl(url);
        setIsLoading(false);
        setAuthStep('ready');
      } catch (error) {
        console.error('❌ Error building Raven URL with stored ERP data:', error);
        setError('Failed to build Raven URL with stored ERP data. Please log in again to refresh ERP data.');
        setIsLoading(false);
        setAuthStep('error');
      }
    };

    initializeRaven();
  }, [authLoading, isAuthenticated, getAuthData, buildRavenUrl, ravenUrl]);

  // Enhanced loading component with authentication steps
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
      {retryCount < maxRetries && (
        <button
          onClick={handleRetry}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Retry ({retryCount + 1}/{maxRetries})
        </button>
      )}
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

  return (
    <>
      <IframeComponent />
      {showERPLogin && (
        <ERPOneTimeLogin
          onLoginSuccess={handleERPLoginSuccess}
          onSkip={handleERPLoginSkip}
        />
      )}
    </>
  );
};

export default RavenEmbed;
