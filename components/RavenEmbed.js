import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import MicrosoftSSOLogin from './MicrosoftSSOLogin';
import TruecallerSSOLogin from './TruecallerSSOLogin';

/**
 * RavenEmbed Component - Embeds Raven chat application via iframe with SSO login
 * 
 * This component:
 * 1. Checks if user is already authenticated
 * 2. If not authenticated, shows SSO login options (Microsoft/Truecaller)
 * 3. After successful login, embeds Raven in iframe with authentication
 * 4. Handles loading states and error scenarios
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
  style = {},
  showSSOOptions = true,
  enableMicrosoftSSO = true,
  enableTruecallerSSO = true,
  apiUrl = "https://erp.elbrit.org"
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [iframeUrl, setIframeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [authStep, setAuthStep] = useState('initializing');
  const [showLogin, setShowLogin] = useState(false);
  const maxRetries = 3;

  // Get authentication data from localStorage
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const erpnextToken = localStorage.getItem('erpnextAuthToken');
      const erpnextUser = localStorage.getItem('erpnextUser');
      const userEmail = localStorage.getItem('userEmail');
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      const authProvider = localStorage.getItem('authProvider');
      const authType = localStorage.getItem('authType');
      
      console.log('🔍 Raven Embed - Auth data found:', {
        hasToken: !!erpnextToken,
        hasUser: !!erpnextUser,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        provider: authProvider,
        authType: authType
      });
      
      return {
        token: erpnextToken,
        user: erpnextUser ? JSON.parse(erpnextUser) : null,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        provider: authProvider,
        authType: authType
      };
    } catch (error) {
      console.error('❌ Error reading auth data from localStorage:', error);
      return null;
    }
  }, []);

  // Build Raven URL with authentication
  const buildRavenUrl = useCallback(async (authData) => {
    if (!authData || !authData.token) {
      console.warn('⚠️ No auth data available, showing login');
      setShowLogin(true);
      return null;
    }

    try {
      console.log('🔐 Building Raven URL with authentication...');
      setAuthStep('authenticating');

      // Try Raven API authentication first
      try {
        const ravenAuthResponse = await fetch('/api/raven/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (ravenAuthResponse.ok) {
          console.log('✅ Raven session created successfully');
          return ravenUrl; // Return base URL for iframe
        }
      } catch (ravenError) {
        console.warn('⚠️ Raven API auth failed:', ravenError);
      }

      // Fallback: Build URL with authentication parameters
      const params = new URLSearchParams();
      params.append('token', authData.token);
      params.append('email', authData.email);
      if (authData.phoneNumber) params.append('phone', authData.phoneNumber);
      if (authData.provider) params.append('provider', authData.provider);
      params.append('sso_login', 'true');
      params.append('_t', Date.now().toString());

      const authenticatedUrl = `${ravenUrl}?${params.toString()}`;
      console.log('🔗 Built authenticated Raven URL');
      return authenticatedUrl;

    } catch (error) {
      console.error('❌ Error building Raven URL:', error);
      setShowLogin(true);
      return null;
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
      setShowLogin(false);
      
      // Force refresh by updating URL with new timestamp
      const authData = getAuthData();
      buildRavenUrl(authData).then(url => {
        if (url) {
          setIframeUrl(url);
        }
      });
    } else {
      console.error('❌ Max retries reached for Raven iframe');
      setError('Failed to load Raven chat after multiple attempts. Please refresh the page.');
    }
  }, [retryCount, maxRetries, getAuthData, buildRavenUrl]);

  // Handle successful SSO login
  const handleSSOSuccess = useCallback(async (loginData) => {
    console.log('✅ SSO login successful:', loginData);
    setAuthStep('authenticating');
    setIsLoading(true);
    setShowLogin(false);
    
    // Wait a moment for auth context to update
    setTimeout(async () => {
      const authData = getAuthData();
      if (authData) {
        const url = await buildRavenUrl(authData);
        if (url) {
          setIframeUrl(url);
        }
      }
    }, 1000);
  }, [getAuthData, buildRavenUrl]);

  // Handle SSO login error
  const handleSSOError = useCallback((error) => {
    console.error('❌ SSO login failed:', error);
    setError('Login failed. Please try again.');
    setIsLoading(false);
  }, []);

  // Initialize iframe URL when auth is ready
  useEffect(() => {
    const initializeRaven = async () => {
      if (authLoading) {
        console.log('⏳ Waiting for authentication to load...');
        setAuthStep('initializing');
        return;
      }

      if (!isAuthenticated) {
        console.log('⚠️ User not authenticated, showing SSO login options');
        setShowLogin(true);
        setIsLoading(false);
        setAuthStep('ready');
        return;
      }

      console.log('🔐 User authenticated, building Raven URL...');
      setAuthStep('initializing');
      const authData = getAuthData();
      
      if (!authData) {
        console.error('❌ No auth data found in localStorage');
        setShowLogin(true);
        setIsLoading(false);
        setAuthStep('ready');
        return;
      }

      try {
        const url = await buildRavenUrl(authData);
        if (url) {
          setIframeUrl(url);
          setIsLoading(false);
          setAuthStep('ready');
        }
      } catch (error) {
        console.error('❌ Error building Raven URL:', error);
        setError('Failed to build Raven URL. Please try again.');
        setIsLoading(false);
        setAuthStep('error');
      }
    };

    initializeRaven();
  }, [authLoading, isAuthenticated, getAuthData, buildRavenUrl]);

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
        {authStep === 'initializing' && 'Initializing Raven Chat...'}
        {authStep === 'authenticating' && 'Authenticating with Raven...'}
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

  // SSO Login component
  const SSOLoginComponent = () => (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: width,
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        padding: '40px 20px'
      }}
    >
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#333',
          fontSize: '24px',
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          Welcome to Raven Chat
        </h2>
        <p style={{
          color: '#666',
          fontSize: '16px',
          margin: '0 0 20px 0'
        }}>
          Please sign in to access the chat
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '300px'
      }}>
        {enableMicrosoftSSO && (
          <div style={{
            width: '100%'
          }}>
            <MicrosoftSSOLogin
              onSuccess={handleSSOSuccess}
              onError={handleSSOError}
            />
          </div>
        )}

        {enableTruecallerSSO && (
          <div style={{
            width: '100%'
          }}>
            <TruecallerSSOLogin
              apiUrl={apiUrl}
              onSuccess={handleSSOSuccess}
              onError={handleSSOError}
              enableAuthIntegration={true}
              redirectOnSuccess={false}
              buttonText="Continue with Truecaller"
              fullWidth={true}
            />
          </div>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center'
      }}>
        Choose your preferred sign-in method
      </div>
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

  if (showLogin && showSSOOptions) {
    return <SSOLoginComponent />;
  }

  if (showLoading && (isLoading || !iframeUrl)) {
    return <LoadingComponent />;
  }

  return <IframeComponent />;
};

export default RavenEmbed;


