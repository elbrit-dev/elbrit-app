import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getERPCookieData, 
  buildRavenUrlWithCookieAuth, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable
} from './utils/erpCookieAuth';
import ERPLoginModal from './ERPLoginModal';

/**
 * RavenEmbed Component - Embeds Raven chat application via iframe with ERP Login Integration
 * 
 * This component:
 * 1. First checks if user is logged into ERP system
 * 2. Shows ERP login modal if not authenticated
 * 3. Stores ERP cookie data in localStorage after successful login
 * 4. Uses ERP cookie data for Raven authentication
 * 5. Embeds Raven in an iframe with seamless auto-login
 * 6. Handles loading states and error scenarios
 * 
 * Benefits of ERP login integration:
 * - Ensures user is logged into ERP before accessing Raven
 * - Stores ERP data in localStorage for future use
 * - Both Raven and ERP share the same cookie domain (.elbrit.org)
 * - No need to pass sensitive authentication tokens in URLs
 * - More secure as cookies are automatically sent by the browser
 * - One-time ERP login for lifetime access
 * 
 * Usage in Plasmic:
 * 1. Register this component in plasmic-init.js
 * 2. Drag and drop "RavenEmbed" component in Plasmic Studio
 * 3. Configure height/width as needed
 */
const RavenEmbed = ({ 
  ravenUrl = "https://uat.elbrit.org/raven",
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
  const [showERPLoginModal, setShowERPLoginModal] = useState(false);
  const [erpLoginRequired, setErpLoginRequired] = useState(false);
  const maxRetries = 3;

  // Get authentication data from ERP cookies or localStorage
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      // First try to get fresh ERP cookie data
      let erpCookieData = getERPCookieData();
      let userInfo = null;

      // If no fresh cookies, try localStorage
      if (!erpCookieData) {
        console.log('🔍 No fresh ERP cookies, checking localStorage...');
        try {
          const storedCookieData = localStorage.getItem('erpCookieData');
          const storedUserInfo = localStorage.getItem('erpUserInfo');
          
          if (storedCookieData && storedUserInfo) {
            erpCookieData = JSON.parse(storedCookieData);
            userInfo = JSON.parse(storedUserInfo);
            console.log('✅ Using stored ERP data from localStorage');
          }
        } catch (storageError) {
          console.warn('⚠️ Error reading stored ERP data:', storageError);
        }
      }

      if (!erpCookieData) {
        console.warn('⚠️ No ERP cookie data available (fresh or stored)');
        setErpLoginRequired(true);
        return null;
      }

      // If we have fresh cookies, extract user info and update localStorage
      if (!userInfo) {
        userInfo = extractUserInfoFromCookies(erpCookieData);
        
        // Store in localStorage for future use
        try {
          localStorage.setItem('erpCookieData', JSON.stringify(erpCookieData));
          localStorage.setItem('erpUserInfo', JSON.stringify(userInfo));
          localStorage.setItem('erpLoginTime', new Date().toISOString());
          console.log('✅ Fresh ERP data stored in localStorage');
        } catch (storageError) {
          console.warn('⚠️ Could not store ERP data in localStorage:', storageError);
        }
      }

      // Validate the data
      if (!validateERPCookieData(erpCookieData)) {
        console.warn('⚠️ ERP cookie data is invalid');
        setErpLoginRequired(true);
        return null;
      }
      
      console.log('🔍 Raven Embed - ERP Auth data found:', {
        hasCookieData: !!erpCookieData,
        userInfo,
        cookieKeys: Object.keys(erpCookieData),
        source: userInfo ? 'fresh' : 'stored'
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
      console.error('❌ Error reading ERP data for Raven Embed:', error);
      setErpLoginRequired(true);
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
      console.log('🍪 Using ERP cookie data for Raven Embed:', {
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

  // Handle ERP login success
  const handleERPLoginSuccess = useCallback((loginData) => {
    console.log('✅ ERP login successful:', loginData);
    setErpLoginRequired(false);
    setShowERPLoginModal(false);
    
    // Refresh auth data and rebuild Raven URL
    const authData = getAuthData();
    if (authData) {
      buildRavenUrl(authData).then(url => {
        setIframeUrl(url);
        setIsLoading(false);
        setAuthStep('ready');
      });
    }
  }, [getAuthData, buildRavenUrl]);

  // Handle ERP login modal close
  const handleERPLoginClose = useCallback(() => {
    setShowERPLoginModal(false);
    if (erpLoginRequired) {
      setError('ERP login is required to access Raven chat.');
      setIsLoading(false);
      setAuthStep('error');
    }
  }, [erpLoginRequired]);

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

      console.log('🔐 User authenticated, checking ERP login status...');
      setAuthStep('initializing');
      const authData = getAuthData();
      
      if (!authData) {
        console.log('❌ No ERP data found, showing ERP login modal');
        console.log('🔍 Setting ERP login required states...');
        setErpLoginRequired(true);
        setShowERPLoginModal(true);
        setIsLoading(false);
        setAuthStep('erp-login-required');
        console.log('✅ ERP login modal should now be visible');
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

  // Show ERP login modal when required
  useEffect(() => {
    console.log('🔍 ERP Login Modal Effect:', { erpLoginRequired, showERPLoginModal });
    if (erpLoginRequired && !showERPLoginModal) {
      console.log('🪟 Triggering ERP login modal display');
      setShowERPLoginModal(true);
    }
  }, [erpLoginRequired, showERPLoginModal]);

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
        {authStep === 'erp-login-required' && 'ERP Login Required...'}
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

  // Debug render state
  console.log('🔍 RavenEmbed Render State:', {
    error: !!error,
    showERPLoginModal,
    erpLoginRequired,
    isLoading,
    iframeUrl: !!iframeUrl,
    authStep
  });

  // Render based on state
  if (error) {
    return <ErrorComponent />;
  }

  // Show ERP login modal if required
  if (showERPLoginModal) {
    console.log('🪟 Rendering ERP login modal');
    return (
      <>
        <LoadingComponent />
        <ERPLoginModal
          isOpen={showERPLoginModal}
          onClose={handleERPLoginClose}
          onLoginSuccess={handleERPLoginSuccess}
          erpUrl="https://uat.elbrit.org/login#login"
          title="ERP Login Required"
          description="Please log in to the ERP system to access Raven chat. This is a one-time setup."
        />
      </>
    );
  }

  if (showLoading && (isLoading || !iframeUrl)) {
    return <LoadingComponent />;
  }

  return <IframeComponent />;
};

export default RavenEmbed;
