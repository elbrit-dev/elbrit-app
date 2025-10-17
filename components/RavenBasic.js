import React, { useEffect, useState, useCallback } from 'react';

/**
 * RavenBasic Component - Simple Raven iframe embed without authentication
 * 
 * This component:
 * 1. Just embeds Raven in an iframe
 * 2. No authentication handling
 * 3. Users can login manually
 * 4. Focus on getting the site to appear first
 */
const RavenBasic = ({ 
  ravenUrl = "https://elbrit-ls.m.erpnext.com/raven",
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

  // Add timeout to detect stuck loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error('⏰ Raven iframe loading timeout after 10 seconds');
        setError('Raven iframe loading timeout. This usually means iframe is blocked by X-Frame-Options or CORS.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('✅ Raven iframe loaded successfully');
    setIsLoading(false);
    setError(null);
    if (onLoad) onLoad();
  }, [onLoad]);

  // Handle iframe error
  const handleIframeError = useCallback((event) => {
    console.error('❌ Raven iframe failed to load:', event);
    console.error('❌ Error details:', {
      type: event?.type,
      target: event?.target,
      currentTarget: event?.currentTarget,
      src: event?.target?.src,
      ravenUrl: ravenUrl
    });
    setError('Failed to load Raven chat. Check console for details.');
    setIsLoading(false);
    if (onError) onError(event);
  }, [onError, ravenUrl]);

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
      <div style={{
        fontSize: '12px',
        color: '#666',
        marginTop: '16px'
      }}>
        <p>This might be due to:</p>
        <ul style={{ textAlign: 'left', margin: '8px 0' }}>
          <li>X-Frame-Options blocking iframe</li>
          <li>Network connection issues</li>
          <li>Raven server not accessible</li>
        </ul>
      </div>
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

export default RavenBasic;
