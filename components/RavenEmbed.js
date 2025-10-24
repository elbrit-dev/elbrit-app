import React, { useState, useCallback, useEffect } from 'react';

/**
 * RavenEmbed Component - Simple iframe embed for Raven chat application with cookie sync
 * 
 * This component:
 * 1. Syncs ERPNext cookies to current domain before loading Raven
 * 2. Embeds Raven in an iframe for user login
 * 3. Handles basic loading states and error scenarios
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cookiesSynced, setCookiesSynced] = useState(false);
  const maxRetries = 3;

  // Sync ERPNext cookies to current domain
  const syncERPNextCookies = useCallback(async () => {
    console.log('🔄 Starting ERPNext cookie sync...');
    
    try {
      // Get ERPNext user data from localStorage (set by AuthContext)
      const erpnextToken = localStorage.getItem('erpnextAuthToken');
      const erpnextUser = localStorage.getItem('erpnextUser');
      const userEmail = localStorage.getItem('userEmail');
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      
      if (!erpnextToken || !erpnextUser) {
        console.warn('⚠️ No ERPNext auth data found in localStorage');
        return false;
      }

      const userData = JSON.parse(erpnextUser);
      console.log(`👤 Found ERPNext user: ${userData.email || userData.phoneNumber}`);

      // Try to get ERPNext session cookies via API
      try {
        const response = await fetch('/api/erpnext/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail || userData.email,
            phoneNumber: userPhoneNumber || userData.phoneNumber,
            token: erpnextToken
          })
        });

        if (response.ok) {
          const sessionData = await response.json();
          console.log('✅ Successfully retrieved ERPNext session data');
          
          // Update Plasmic cookies with ERPNext data
          if (sessionData.cookies) {
            Object.entries(sessionData.cookies).forEach(([name, value]) => {
              // Set cookie for current domain
              document.cookie = `${name}=${value}; path=/; secure; samesite=lax`;
              console.log(`🍪 Set cookie: ${name}=${value}`);
            });
          }
          
          setCookiesSynced(true);
          return true;
        }
      } catch (apiError) {
        console.warn(`⚠️ ERPNext API call failed: ${apiError.message}`);
      }

      // Fallback: Try to set basic user cookies from localStorage data
      const cookiesToSet = {
        'full_name': userData.displayName || userData.fullName || 'User',
        'user_id': userData.email || userData.phoneNumber || 'user',
        'system_user': 'yes',
        'sid': erpnextToken.substring(0, 20) // Use first 20 chars of token as session ID
      };

      Object.entries(cookiesToSet).forEach(([name, value]) => {
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; secure; samesite=lax`;
        console.log(`🍪 Set fallback cookie: ${name}=${value}`);
      });

      console.log('✅ Set fallback cookies from localStorage data');
      setCookiesSynced(true);
      return true;

    } catch (error) {
      console.error(`❌ Cookie sync error: ${error.message}`);
      return false;
    }
  }, []);

  // Initialize cookie sync
  useEffect(() => {
    syncERPNextCookies();
  }, [syncERPNextCookies]);

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
      
      // Force refresh by updating iframe src with new timestamp
      const iframe = document.querySelector('iframe[title="Raven Chat"]');
      if (iframe) {
        const currentSrc = iframe.src;
        const separator = currentSrc.includes('?') ? '&' : '?';
        iframe.src = `${currentSrc}${separator}_t=${Date.now()}`;
      }
    } else {
      console.error('❌ Max retries reached for Raven iframe');
      setError('Failed to load Raven chat after multiple attempts. Please refresh the page.');
    }
  }, [retryCount, maxRetries]);

  // Simple loading component
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
        {cookiesSynced ? 'Loading Raven Chat...' : 'Syncing authentication...'}
      </p>
      <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
        {cookiesSynced ? 'Please wait while we load the chat interface' : 'Updating cookies for proper login'}
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
      src={ravenUrl}
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

  if (showLoading && isLoading) {
    return <LoadingComponent />;
  }

  return <IframeComponent />;
};

export default RavenEmbed;


