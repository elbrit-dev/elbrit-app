import React, { useState, useCallback, useEffect, useRef } from 'react';

/**
 * RavenEmbedEnhanced Component - Enhanced iframe embed for Raven chat with session handling
 * 
 * This component addresses common iframe session issues:
 * 1. Handles session persistence across iframe loads
 * 2. Manages authentication state properly
 * 3. Provides fallback mechanisms for login issues
 * 4. Includes debugging capabilities
 * 
 * Usage in Plasmic:
 * 1. Register this component in plasmic-init.js
 * 2. Drag and drop "RavenEmbedEnhanced" component in Plasmic Studio
 * 3. Configure height/width as needed
 */
const RavenEmbedEnhanced = ({ 
  ravenUrl = "https://erp.elbrit.org/raven",
  height = "90vh",
  width = "100%",
  showLoading = true,
  onLoad = null,
  onError = null,
  className = "",
  style = {},
  enableDebug = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(ravenUrl);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const iframeRef = useRef(null);
  const maxRetries = 3;

  // Debug logging
  const addDebugLog = useCallback((message, type = 'info') => {
    if (enableDebug) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        type
      };
      setDebugLogs(prev => [...prev.slice(-9), logEntry]);
      console.log(`[RavenEmbedEnhanced] ${message}`);
    }
  }, [enableDebug]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    addDebugLog('Iframe loaded successfully', 'success');
    setIsLoading(false);
    setError(null);
    
    // Check if we're on login page or main app
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Try to detect if we're on login page
        const iframeUrl = iframe.src;
        if (iframeUrl.includes('/login')) {
          addDebugLog('Detected login page - session may not be established', 'warning');
          setSessionEstablished(false);
        } else {
          addDebugLog('Detected main app - session appears established', 'success');
          setSessionEstablished(true);
        }
      }
    } catch (e) {
      addDebugLog('Could not access iframe content (CORS)', 'warning');
    }
    
    if (onLoad) onLoad();
  }, [onLoad, addDebugLog]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    addDebugLog('Iframe failed to load', 'error');
    setError('Failed to load Raven chat. Please check your connection.');
    setIsLoading(false);
    if (onError) onError();
  }, [onError, addDebugLog]);

  // Enhanced retry mechanism with session handling
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      addDebugLog(`Retrying Raven load (attempt ${retryCount + 1}/${maxRetries})`, 'info');
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setError(null);
      
      // Try different approaches based on retry count
      let newUrl = ravenUrl;
      
      if (retryCount === 0) {
        // First retry: Add timestamp to force refresh
        newUrl = `${ravenUrl}?_t=${Date.now()}`;
        addDebugLog('First retry: Adding timestamp', 'info');
      } else if (retryCount === 1) {
        // Second retry: Try with session parameter
        newUrl = `${ravenUrl}?session=retry&_t=${Date.now()}`;
        addDebugLog('Second retry: Adding session parameter', 'info');
      } else {
        // Third retry: Try login URL first
        newUrl = `${ravenUrl}/login?_t=${Date.now()}`;
        addDebugLog('Third retry: Trying login URL first', 'info');
      }
      
      setCurrentUrl(newUrl);
    } else {
      addDebugLog('Max retries reached for Raven iframe', 'error');
      setError('Failed to load Raven chat after multiple attempts. Please refresh the page.');
    }
  }, [retryCount, maxRetries, ravenUrl, addDebugLog]);

  // Force refresh iframe
  const forceRefresh = useCallback(() => {
    addDebugLog('Force refreshing iframe', 'info');
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    
    const newUrl = `${ravenUrl}?_t=${Date.now()}`;
    setCurrentUrl(newUrl);
  }, [ravenUrl, addDebugLog]);

  // Sync ERPNext cookies to current domain
  const syncERPNextCookies = useCallback(async () => {
    addDebugLog('Starting ERPNext cookie sync', 'info');
    
    try {
      // Get ERPNext user data from localStorage (set by AuthContext)
      const erpnextToken = localStorage.getItem('erpnextAuthToken');
      const erpnextUser = localStorage.getItem('erpnextUser');
      const userEmail = localStorage.getItem('userEmail');
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      
      if (!erpnextToken || !erpnextUser) {
        addDebugLog('No ERPNext auth data found in localStorage', 'warning');
        return false;
      }

      const userData = JSON.parse(erpnextUser);
      addDebugLog(`Found ERPNext user: ${userData.email || userData.phoneNumber}`, 'info');

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
          addDebugLog('Successfully retrieved ERPNext session data', 'success');
          
          // Update Plasmic cookies with ERPNext data
          if (sessionData.cookies) {
            Object.entries(sessionData.cookies).forEach(([name, value]) => {
              // Set cookie for current domain
              document.cookie = `${name}=${value}; path=/; secure; samesite=lax`;
              addDebugLog(`Set cookie: ${name}=${value}`, 'info');
            });
          }
          
          return true;
        }
      } catch (apiError) {
        addDebugLog(`ERPNext API call failed: ${apiError.message}`, 'warning');
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
        addDebugLog(`Set fallback cookie: ${name}=${value}`, 'info');
      });

      addDebugLog('Set fallback cookies from localStorage data', 'success');
      return true;

    } catch (error) {
      addDebugLog(`Cookie sync error: ${error.message}`, 'error');
      return false;
    }
  }, [addDebugLog]);

  // Handle session establishment
  const establishSession = useCallback(async () => {
    addDebugLog('Attempting to establish session', 'info');
    
    // First try to sync ERPNext cookies
    const cookieSyncSuccess = await syncERPNextCookies();
    
    try {
      // Method 1: Try to access Raven with session cookies
      const response = await fetch(ravenUrl, {
        method: 'HEAD',
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        addDebugLog('Session appears to be valid', 'success');
        setSessionEstablished(true);
        return true;
      } else {
        addDebugLog(`Session check failed: ${response.status}`, 'warning');
        return false;
      }
    } catch (error) {
      addDebugLog(`Session check error: ${error.message}`, 'warning');
      return false;
    }
  }, [ravenUrl, addDebugLog, syncERPNextCookies]);

  // Initialize component
  useEffect(() => {
    addDebugLog('Initializing RavenEmbedEnhanced', 'info');
    establishSession();
  }, [establishSession, addDebugLog]);

  // Handle URL changes
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  }, [currentUrl]);

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
        Loading Raven Chat...
      </p>
      <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
        {sessionEstablished ? 'Session established' : 'Establishing session...'}
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Error component with enhanced options
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
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
          >
            Retry ({retryCount + 1}/{maxRetries})
          </button>
        )}
        
        <button
          onClick={forceRefresh}
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
          Force Refresh
        </button>
        
        <button
          onClick={() => window.open(ravenUrl, '_blank')}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Open in New Tab
        </button>
      </div>
    </div>
  );

  // Debug panel
  const DebugPanel = () => {
    if (!enableDebug) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Debug Logs:</div>
        {debugLogs.map((log, index) => (
          <div key={index} style={{ 
            marginBottom: '2px',
            color: log.type === 'error' ? '#ff6b6b' : 
                   log.type === 'warning' ? '#ffd93d' : 
                   log.type === 'success' ? '#6bcf7f' : '#ffffff'
          }}>
            [{log.timestamp.split('T')[1].split('.')[0]}] {log.message}
          </div>
        ))}
      </div>
    );
  };

  // Main iframe component
  const IframeComponent = () => (
    <div style={{ position: 'relative', width: width, height: height }}>
      <iframe
        ref={iframeRef}
        src={currentUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#fff',
          ...style
        }}
        className={className}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Raven Chat"
        allow="camera; microphone; notifications; clipboard-read; clipboard-write; autoplay"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation"
      />
      <DebugPanel />
    </div>
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

export default RavenEmbedEnhanced;
