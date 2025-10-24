import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

/**
 * RavenLauncher Component - Opens Raven in new window/tab instead of iframe
 * 
 * This component:
 * 1. Creates a button to open Raven in new window
 * 2. Handles authentication by passing token via URL
 * 3. Provides fallback if iframe embedding is blocked
 */
const RavenLauncher = ({ 
  ravenUrl = "https://erp.elbrit.org",
  buttonText = null, // Will be set based on device
  buttonStyle = {},
  className = "",
  onOpen = null,
  onError = null
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [ravenWindow, setRavenWindow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Build Raven URL with authentication
  const buildRavenUrl = useCallback((authData) => {
    if (!authData || !authData.token) {
      console.warn('⚠️ No auth data available, redirecting to login');
      return `${ravenUrl}/login`;
    }

    // Build URL with authentication parameters
    const params = new URLSearchParams();
    params.append('token', authData.token);
    if (authData.email) params.append('email', authData.email);
    if (authData.phoneNumber) params.append('phone', authData.phoneNumber);
    if (authData.provider) params.append('provider', authData.provider);
    params.append('_t', Date.now().toString());

    return `${ravenUrl}?${params.toString()}`;
  }, [ravenUrl]);

  // Detect mobile device
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Open Raven (mobile app or web)
  const openRaven = useCallback(() => {
    if (!isAuthenticated) {
      setError('Please log in first to access Raven chat');
      if (onError) onError('Not authenticated');
      return;
    }

    const authData = getAuthData();
    if (!authData) {
      setError('Authentication data not found. Please log in again.');
      if (onError) onError('No auth data');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = buildRavenUrl(authData);
      console.log('🔗 Opening Raven URL:', url.replace(authData.token, '[TOKEN_REDACTED]'));

      if (isMobile()) {
        // Mobile: Try to open Raven mobile app
        console.log('📱 Mobile detected - opening Raven mobile app');
        
        // iOS App Store link
        const iosAppUrl = 'https://apps.apple.com/app/id6741682327';
        // Android Play Store link (you'll need to get the actual link)
        const androidAppUrl = 'https://play.google.com/store/apps/details?id=com.raven.app';
        
        // Try to open the mobile app with deep link
        const mobileAppUrl = `raven://open?url=${encodeURIComponent(url)}`;
        
        // First try the mobile app deep link
        const mobileWindow = window.open(mobileAppUrl, '_self');
        
        // If mobile app doesn't open, fallback to app store
        setTimeout(() => {
          if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            window.open(iosAppUrl, '_blank');
          } else if (navigator.userAgent.includes('Android')) {
            window.open(androidAppUrl, '_blank');
          } else {
            // Fallback to web version
            window.open(url, '_blank');
          }
        }, 1000);
        
      } else {
        // Desktop: Open Raven in new window
        console.log('💻 Desktop detected - opening Raven in new window');
        
        const newWindow = window.open(
          url,
          'raven-chat',
          'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
        );

        if (!newWindow) {
          throw new Error('Popup blocked. Please allow popups for this site.');
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
      }

      if (onOpen) onOpen();

    } catch (error) {
      console.error('❌ Error opening Raven:', error);
      setError(error.message);
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAuthData, buildRavenUrl, isMobile, onOpen, onError]);

  // Close Raven window
  const closeRaven = useCallback(() => {
    if (ravenWindow && !ravenWindow.closed) {
      ravenWindow.close();
      setRavenWindow(null);
    }
  }, [ravenWindow]);

  // Default button styles
  const defaultButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    ...buttonStyle
  };

  const hoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  };

  const [isHovered, setIsHovered] = useState(false);

  // Set button text based on device
  const getButtonText = useCallback(() => {
    if (buttonText) return buttonText; // Use custom text if provided
    
    if (isMobile()) {
      return "📱 Open Raven App";
    } else {
      return "🪶 Open Raven Chat";
    }
  }, [buttonText, isMobile]);

  if (authLoading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        borderRadius: '8px',
        border: '1px solid #f5c6cb',
        color: '#721c24'
      }}>
        <p><strong>Please log in first to access Raven chat</strong></p>
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={openRaven}
          disabled={isLoading}
          style={{
            ...defaultButtonStyle,
            ...(isHovered ? hoverStyle : {}),
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Opening Raven...
            </>
        ) : (
          <>
            {getButtonText()}
          </>
        )}
        </button>

        {ravenWindow && !ravenWindow.closed && (
          <button
            onClick={closeRaven}
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
            Close Raven
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RavenLauncher;
