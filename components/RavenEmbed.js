import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getERPAuthData,
  buildRavenUrlWithCookieAuth, 
  isERPCookieAuthAvailable
} from './utils/erpCookieAuth';

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
  const maxRetries = 3;

  // Get authentication data from stored ERP data or live cookies
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Get ERP authentication data (tries stored data first, then live cookies)
      const erpAuthData = getERPAuthData();
      
      if (!erpAuthData) {
        console.warn('⚠️ No ERP authentication data available for Raven Embed (stored or live)');
        return null;
      }

      console.log('🔍 Raven Embed - ERP Auth data found:', {
        source: erpAuthData.source,
        hasCookieData: !!erpAuthData.cookieData,
        userInfo: erpAuthData.userInfo,
        cookieKeys: Object.keys(erpAuthData.cookieData || {})
      });
      
      return {
        cookieData: erpAuthData.cookieData,
        userInfo: erpAuthData.userInfo,
        email: erpAuthData.userInfo?.email,
        fullName: erpAuthData.userInfo?.fullName,
        userId: erpAuthData.userInfo?.userId,
        sessionId: erpAuthData.userInfo?.sessionId,
        systemUser: erpAuthData.userInfo?.systemUser,
        source: erpAuthData.source
      };
    } catch (error) {
      console.error('❌ Error reading ERP authentication data for Raven Embed:', error);
      return null;
    }
  }, []);

  // Enhanced authentication using ERP cookie data
  const buildRavenUrl = useCallback(async (authData) => {
    if (!authData || !authData.cookieData) {
      console.warn('⚠️ No ERP cookie data available, redirecting to login');
      return `${ravenUrl}/login`;
    }

    try {
      console.log('🔐 Starting enhanced Raven authentication with ERP cookies...');
      setAuthStep('authenticating');

      // Check if ERP cookie authentication is available
      if (!isERPCookieAuthAvailable()) {
        console.warn('⚠️ ERP cookie authentication not available');
        return `${ravenUrl}/login`;
      }

      // Build Raven URL using ERP cookie data
      const authenticatedUrl = buildRavenUrlWithCookieAuth(ravenUrl, authData.cookieData);
      
      console.log('✅ Built enhanced Raven URL with ERP cookie authentication');
      console.log('🍪 Using ERP data for Raven Embed:', {
        source: authData.source,
        user_id: authData.userId,
        full_name: authData.fullName,
        system_user: authData.systemUser,
        session_id: authData.sessionId ? 'available' : 'missing'
      });

      return authenticatedUrl;

    } catch (error) {
      console.error('❌ Error in ERP cookie Raven authentication:', error);
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

      console.log('🔐 User authenticated, building enhanced Raven URL with ERP cookies...');
      setAuthStep('initializing');
      const authData = getAuthData();
      
      if (!authData) {
        console.error('❌ No ERP cookie data found');
        setError('ERP authentication data not found. Please ensure you are logged into ERP system.');
        setIsLoading(false);
        setAuthStep('error');
        return;
      }

      try {
        const url = await buildRavenUrl(authData);
        setIframeUrl(url);
        setIsLoading(false);
        setAuthStep('ready');
      } catch (error) {
        console.error('❌ Error building Raven URL with ERP cookies:', error);
        setError('Failed to build Raven URL with ERP cookies. Please ensure you are logged into ERP system.');
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
      allow="camera; microphone; notifications; clipboard-read; clipboard-write"
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

export default RavenEmbed;
