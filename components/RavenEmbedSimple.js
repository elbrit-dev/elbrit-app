import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

/**
 * RavenEmbedSimple Component - Simplified Raven embedding with better authentication
 * 
 * This component uses a more reliable approach:
 * 1. Creates a hidden iframe to authenticate first
 * 2. Then loads the main Raven iframe with shared cookies
 * 3. Falls back gracefully if authentication fails
 */
const RavenEmbedSimple = ({ 
  ravenUrl = "https://elbrit-ls.m.erpnext.com/raven",
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
  const [authStep, setAuthStep] = useState('initializing'); // 'initializing', 'authenticating', 'ready', 'error'

  // Get authentication data from localStorage
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const erpnextToken = localStorage.getItem('erpnextAuthToken');
      const erpnextUser = localStorage.getItem('erpnextUser');
      const userEmail = localStorage.getItem('userEmail');
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      const authProvider = localStorage.getItem('authProvider');
      
      console.log('🔍 Raven Simple - Auth data found:', {
        hasToken: !!erpnextToken,
        hasUser: !!erpnextUser,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        provider: authProvider
      });
      
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

  // Simple authentication approach
  const authenticateWithRaven = useCallback(async (authData) => {
    try {
      setAuthStep('authenticating');
      
      // Method 1: Try to use ERPNext session directly (if same domain)
      // Since Raven is on erp.elbrit.org, we can try to share the ERPNext session
      
      // Create a hidden iframe to establish session
      const authIframe = document.createElement('iframe');
      authIframe.style.display = 'none';
      authIframe.src = `${ravenUrl}/login`;
      
      return new Promise((resolve, reject) => {
        authIframe.onload = () => {
          console.log('✅ Auth iframe loaded, trying to authenticate...');
          
          // Try to access Raven with ERPNext credentials
          // This assumes Raven can read ERPNext cookies if they're on the same domain
          setTimeout(() => {
            document.body.removeChild(authIframe);
            
            // Now try to load the main Raven app
            const mainUrl = ravenUrl;
            console.log('🔗 Loading main Raven URL:', mainUrl);
            resolve(mainUrl);
          }, 2000); // Give time for session establishment
        };
        
        authIframe.onerror = () => {
          console.error('❌ Auth iframe failed to load');
          document.body.removeChild(authIframe);
          reject(new Error('Failed to authenticate with Raven'));
        };
        
        document.body.appendChild(authIframe);
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }, [ravenUrl]);

  // Initialize Raven
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

      console.log('🔐 User authenticated, initializing Raven...');
      const authData = getAuthData();
      
      if (!authData) {
        console.error('❌ No auth data found in localStorage');
        setError('Authentication data not found. Please log in again.');
        setIsLoading(false);
        setAuthStep('error');
        return;
      }

      try {
        const url = await authenticateWithRaven(authData);
        setIframeUrl(url);
        setIsLoading(false);
        setAuthStep('ready');
      } catch (error) {
        console.error('❌ Error initializing Raven:', error);
        setError('Failed to authenticate with Raven. Please check your connection.');
        setIsLoading(false);
        setAuthStep('error');
      }
    };

    initializeRaven();
  }, [authLoading, isAuthenticated, getAuthData, authenticateWithRaven]);

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
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        Retry
      </button>
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

export default RavenEmbedSimple;
