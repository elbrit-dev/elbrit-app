import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

/**
 * RavenAutoLogin Component - Enhanced auto-login for Raven
 * 
 * This component:
 * 1. Uses ERPNext API to authenticate with Raven
 * 2. Creates proper session for auto-login
 * 3. Handles both iframe and new window approaches
 * 4. Provides better error handling and retry logic
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

  // Get authentication data from localStorage
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const erpnextToken = localStorage.getItem('erpnextAuthToken');
      const erpnextUser = localStorage.getItem('erpnextUser');
      const userEmail = localStorage.getItem('userEmail');
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      const authProvider = localStorage.getItem('authProvider');
      
      return {
        token: erpnextToken,
        user: erpnextUser ? JSON.parse(erpnextUser) : null,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        provider: authProvider
      };
    } catch (error) {
      console.error('❌ Error reading auth data from localStorage:', error);
      return null;
    }
  }, []);

  // Enhanced authentication with ERPNext API
  const authenticateWithRaven = useCallback(async (authData) => {
    try {
      setAuthStep('authenticating');
      console.log('🔐 Starting Raven authentication...');

      // Method 1: Try ERPNext API authentication
      const erpnextResponse = await fetch('/api/erpnext/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authData.email,
          phoneNumber: authData.phoneNumber,
          authProvider: authData.provider
        })
      });

      if (erpnextResponse.ok) {
        const erpnextData = await erpnextResponse.json();
        console.log('✅ ERPNext authentication successful');
        
        // Method 2: Try to create Raven session
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
          console.warn('⚠️ Raven API auth failed, using direct approach:', ravenError);
        }

        // Method 3: Build URL with enhanced authentication
        const params = new URLSearchParams();
        params.append('token', authData.token);
        params.append('email', authData.email);
        if (authData.phoneNumber) params.append('phone', authData.phoneNumber);
        if (authData.provider) params.append('provider', authData.provider);
        params.append('auto_login', 'true');
        params.append('_t', Date.now().toString());

        const authenticatedUrl = `${ravenUrl}?${params.toString()}`;
        console.log('🔗 Built authenticated Raven URL');
        return authenticatedUrl;

      } else {
        throw new Error('ERPNext authentication failed');
      }

    } catch (error) {
      console.error('❌ Authentication error:', error);
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

      console.log('🔐 User authenticated, initializing Raven with auto-login...');
      const authData = getAuthData();
      
      if (!authData) {
        console.error('❌ No auth data found in localStorage');
        setError('Authentication data not found. Please log in again.');
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
        console.error('❌ Error initializing Raven:', error);
        setError('Failed to authenticate with Raven. Please try again.');
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
