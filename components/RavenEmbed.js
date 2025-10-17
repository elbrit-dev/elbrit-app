import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

/**
 * RavenEmbed Component - Embeds Raven chat application via iframe with auto-login
 * 
 * This component:
 * 1. Reads user credentials from localStorage (erpnextAuthToken, userEmail, etc.)
 * 2. Constructs Raven URL with authentication parameters
 * 3. Embeds Raven in an iframe with seamless auto-login
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
  style = {}
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [iframeUrl, setIframeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
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
      console.warn('⚠️ No auth data available, redirecting to login');
      return `${ravenUrl}/login`;
    }

    try {
      // Use our API endpoint to create a proper Frappe session
      const params = new URLSearchParams();
      params.append('token', authData.token);
      if (authData.email) params.append('email', authData.email);
      if (authData.phoneNumber) params.append('phone', authData.phoneNumber);
      if (authData.provider) params.append('provider', authData.provider);
      
      // Call our API to authenticate and get session
      const response = await fetch(`/api/raven/auth?${params.toString()}`);
      
      if (response.ok) {
        // API will set cookies and redirect, so we just use the base Raven URL
        console.log('✅ Raven authentication successful via API');
        return ravenUrl;
      } else {
        console.warn('⚠️ API auth failed, trying direct approach');
        // Fallback to direct URL with token
        const directParams = new URLSearchParams();
        directParams.append('token', authData.token);
        if (authData.email) directParams.append('email', authData.email);
        directParams.append('_t', Date.now().toString());
        return `${ravenUrl}?${directParams.toString()}`;
      }
    } catch (error) {
      console.error('❌ Error in Raven auth:', error);
      // Fallback to direct approach
      const params = new URLSearchParams();
      params.append('token', authData.token);
      if (authData.email) params.append('email', authData.email);
      params.append('_t', Date.now().toString());
      return `${ravenUrl}?${params.toString()}`;
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
        return;
      }

      if (!isAuthenticated) {
        console.warn('⚠️ User not authenticated, redirecting to Raven login');
        setIframeUrl(`${ravenUrl}/login`);
        setIsLoading(false);
        return;
      }

      console.log('🔐 User authenticated, building Raven URL...');
      const authData = getAuthData();
      
      if (!authData) {
        console.error('❌ No auth data found in localStorage');
        setError('Authentication data not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const url = await buildRavenUrl(authData);
        setIframeUrl(url);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error building Raven URL:', error);
        setError('Failed to build Raven URL. Please try again.');
        setIsLoading(false);
      }
    };

    initializeRaven();
  }, [authLoading, isAuthenticated, getAuthData, buildRavenUrl, ravenUrl]);

  // Loading component
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
      <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
        Loading Raven Chat...
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
