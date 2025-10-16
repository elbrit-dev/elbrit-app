import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

/**
 * TokenChecker Component - Shows token details and validation
 * 
 * This component helps debug authentication by showing:
 * 1. What token is stored in localStorage
 * 2. Token format and contents
 * 3. Token expiration status
 * 4. Whether token is being used for Raven
 */
const TokenChecker = ({ 
  showDetails = true,
  compact = false 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [tokenData, setTokenData] = useState(null);
  const [ravenUrl, setRavenUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('erpnextAuthToken');
    const userEmail = localStorage.getItem('userEmail');
    const userPhoneNumber = localStorage.getItem('userPhoneNumber');
    const authProvider = localStorage.getItem('authProvider');

    if (token) {
      try {
        // Decode the token to see what's inside
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [uid, timestamp] = decoded.split(':');
        
        // Calculate token age
        const tokenAge = Date.now() - parseInt(timestamp);
        const tokenAgeMinutes = Math.round(tokenAge / 1000 / 60);
        const tokenAgeHours = Math.round(tokenAgeMinutes / 60);
        const isExpired = tokenAge > (24 * 60 * 60 * 1000); // 24 hours

        setTokenData({
          token: token,
          decoded: decoded,
          uid: uid,
          timestamp: timestamp,
          tokenAge: tokenAge,
          tokenAgeMinutes: tokenAgeMinutes,
          tokenAgeHours: tokenAgeHours,
          isExpired: isExpired,
          userEmail: userEmail,
          userPhoneNumber: userPhoneNumber,
          authProvider: authProvider
        });

        // Build the Raven URL that would be used
        const params = new URLSearchParams();
        params.append('token', token);
        if (userEmail) params.append('email', userEmail);
        if (userPhoneNumber) params.append('phone', userPhoneNumber);
        if (authProvider) params.append('provider', authProvider);
        params.append('_t', Date.now().toString());

        setRavenUrl(`https://erp.elbrit.org/raven?${params.toString()}`);

      } catch (error) {
        console.error('Error decoding token:', error);
        setTokenData({
          token: token,
          error: 'Failed to decode token',
          userEmail: userEmail,
          userPhoneNumber: userPhoneNumber,
          authProvider: authProvider
        });
      }
    }
  }, [user, isAuthenticated]);

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        backgroundColor: tokenData?.isExpired ? '#fed7d7' : '#d4edda',
        color: tokenData?.isExpired ? '#721c24' : '#155724',
        border: `1px solid ${tokenData?.isExpired ? '#f5c6cb' : '#c3e6cb'}`
      }}>
        <span style={{ marginRight: '4px' }}>
          {tokenData?.isExpired ? '⚠️' : '✅'}
        </span>
        Token: {tokenData ? (tokenData.isExpired ? 'Expired' : 'Valid') : 'None'}
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        color: '#721c24'
      }}>
        <strong>❌ No Token Found</strong>
        <p>User needs to log in first to generate an authentication token.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🔑 Authentication Token Details</h3>
      
      {showDetails && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <strong>Token Status:</strong>
            <span style={{
              marginLeft: '8px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: tokenData.isExpired ? '#f8d7da' : '#d4edda',
              color: tokenData.isExpired ? '#721c24' : '#155724',
              fontSize: '12px'
            }}>
              {tokenData.isExpired ? '⚠️ EXPIRED' : '✅ VALID'}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Token (Base64):</strong>
            <div style={{
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '12px'
            }}>
              {tokenData.token}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Decoded Token:</strong>
            <div style={{
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {tokenData.decoded}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Token Contents:</strong>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              <li><strong>User ID:</strong> {tokenData.uid}</li>
              <li><strong>Created:</strong> {new Date(parseInt(tokenData.timestamp)).toLocaleString()}</li>
              <li><strong>Age:</strong> {tokenData.tokenAgeHours} hours ({tokenData.tokenAgeMinutes} minutes)</li>
              <li><strong>User Email:</strong> {tokenData.userEmail || 'Not available'}</li>
              <li><strong>Phone:</strong> {tokenData.userPhoneNumber || 'Not available'}</li>
              <li><strong>Provider:</strong> {tokenData.authProvider || 'Not available'}</li>
            </ul>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Raven URL (with token):</strong>
            <div style={{
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '12px'
            }}>
              {ravenUrl.replace(tokenData.token, '[TOKEN_REDACTED]')}
            </div>
          </div>

          <div style={{
            padding: '10px',
            backgroundColor: tokenData.isExpired ? '#fff3cd' : '#d1ecf1',
            border: `1px solid ${tokenData.isExpired ? '#ffeaa7' : '#bee5eb'}`,
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <strong>Token Usage:</strong>
            {tokenData.isExpired ? (
              <span style={{ color: '#856404' }}>
                ⚠️ This token has expired (older than 24 hours). User needs to log in again.
              </span>
            ) : (
              <span style={{ color: '#0c5460' }}>
                ✅ This token is valid and can be used for Raven authentication.
              </span>
            )}
          </div>
        </>
      )}

      {tokenData.error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '12px'
        }}>
          <strong>Error:</strong> {tokenData.error}
        </div>
      )}
    </div>
  );
};

export default TokenChecker;
