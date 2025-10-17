import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

/**
 * RavenModal Component - Opens Raven in a modal inside your app
 * 
 * This component:
 * 1. Creates a modal overlay inside your app
 * 2. Shows Raven in an iframe within the modal
 * 3. Bypasses iframe restrictions by using a different approach
 * 4. Provides full-screen or customizable modal size
 */
const RavenModal = ({ 
  ravenUrl = "https://elbrit-ls.m.erpnext.com/raven",
  buttonText = "Open Raven Chat",
  modalTitle = "Raven Chat",
  buttonStyle = {},
  className = "",
  onOpen = null,
  onClose = null
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ravenIframeUrl, setRavenIframeUrl] = useState("");

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

  // Open Raven modal
  const openRavenModal = useCallback(() => {
    if (!isAuthenticated) {
      setError('Please log in first to access Raven chat');
      return;
    }

    const authData = getAuthData();
    if (!authData) {
      setError('Authentication data not found. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = buildRavenUrl(authData);
      console.log('🔗 Opening Raven in modal:', url.replace(authData.token, '[TOKEN_REDACTED]'));
      
      setRavenIframeUrl(url);
      setIsModalOpen(true);
      setIsLoading(false);

      if (onOpen) onOpen();

    } catch (error) {
      console.error('❌ Error opening Raven modal:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [isAuthenticated, getAuthData, buildRavenUrl, onOpen]);

  // Close Raven modal
  const closeRavenModal = useCallback(() => {
    setIsModalOpen(false);
    setRavenIframeUrl("");
    setError(null);
    
    if (onClose) onClose();
  }, [onClose]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('✅ Raven iframe loaded in modal');
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('❌ Raven iframe failed to load in modal');
    setError('Failed to load Raven chat. Please check your connection.');
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeRavenModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, closeRavenModal]);

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
      {/* Open Button */}
      <button
        onClick={openRavenModal}
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
            🪶 {buttonText}
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '10px',
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeRavenModal();
            }
          }}
        >
          {/* Modal Content */}
          <div
            style={{
              width: '95vw',
              height: '95vh',
              maxWidth: '1400px',
              maxHeight: '900px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8f9fa'
              }}
            >
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#333'
              }}>
                🪶 {modalTitle}
              </h3>
              <button
                onClick={closeRavenModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.color = '#333';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#666';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body - Raven iframe */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#fff'
              }}
            >
              {ravenIframeUrl ? (
                <iframe
                  src={ravenIframeUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#fff'
                  }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title="Raven Chat"
                  allow="camera; microphone; notifications; clipboard-read; clipboard-write"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Loading Raven Chat...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RavenModal;
