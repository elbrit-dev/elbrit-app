/**
 * ERP Cookie Authentication Utility
 * 
 * This utility extracts ERP cookie data from the browser and uses it for Raven authentication.
 * Since both Raven and ERP share the same cookie domain (.elbrit.org), this ensures
 * proper user identification and authentication.
 */

/**
 * Get ERP cookie data from browser
 * @returns {Object|null} Cookie data object or null if not available
 */
export const getERPCookieData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get all cookies for the current domain
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    console.log('🍪 Available cookies:', Object.keys(cookies));

    // Extract ERP-specific cookie data
    const erpCookieData = {
      full_name: cookies.full_name || null,
      user_id: cookies.user_id || null,
      system_user: cookies.system_user || null,
      sid: cookies.sid || null,
      user_image: cookies.user_image || null,
      // Additional ERP cookies that might be useful
      _ga: cookies._ga || null,
      _ga_YRM9WGML: cookies._ga_YRM9WGML || null
    };

    // Check if we have essential ERP authentication cookies
    const hasEssentialData = erpCookieData.user_id && erpCookieData.full_name;
    
    console.log('🔍 ERP Cookie Data:', {
      hasEssentialData,
      user_id: erpCookieData.user_id,
      full_name: erpCookieData.full_name,
      system_user: erpCookieData.system_user,
      hasSessionId: !!erpCookieData.sid
    });

    return hasEssentialData ? erpCookieData : null;

  } catch (error) {
    console.error('❌ Error extracting ERP cookie data:', error);
    return null;
  }
};

/**
 * Build Raven authentication URL using ERP cookie data with SSO support
 * @param {string} ravenBaseUrl - Base URL for Raven
 * @param {Object} cookieData - ERP cookie data
 * @param {boolean} useSSO - Whether to use SSO login flow
 * @returns {string} Authenticated Raven URL
 */
export const buildRavenUrlWithCookieAuth = (ravenBaseUrl, cookieData, useSSO = true) => {
  if (!cookieData || !ravenBaseUrl) {
    return `${ravenBaseUrl}/login`;
  }

  try {
    // If using SSO, redirect to UAT login first
    if (useSSO) {
      const ssoParams = new URLSearchParams();
      
      // Pass ERP cookie data as URL parameters for SSO
      if (cookieData.user_id) ssoParams.append('erp_user_id', cookieData.user_id);
      if (cookieData.full_name) ssoParams.append('erp_full_name', cookieData.full_name);
      if (cookieData.system_user) ssoParams.append('erp_system_user', cookieData.system_user);
      if (cookieData.sid) ssoParams.append('erp_session_id', cookieData.sid);
      if (cookieData.user_image) ssoParams.append('erp_user_image', cookieData.user_image);
      
      // Add SSO parameters
      ssoParams.append('sso_login', 'true');
      ssoParams.append('auth_method', 'erp_cookies_sso');
      ssoParams.append('redirect_to', ravenBaseUrl);
      ssoParams.append('_t', Date.now().toString());

      const ssoUrl = `https://uat.elbrit.org/raven/login?${ssoParams.toString()}`;
      console.log('🔗 Built Raven SSO URL with ERP cookie auth');
      return ssoUrl;
    } else {
      // Direct authentication (fallback)
      const params = new URLSearchParams();
      
      // Pass ERP cookie data as URL parameters for Raven to use
      if (cookieData.user_id) params.append('erp_user_id', cookieData.user_id);
      if (cookieData.full_name) params.append('erp_full_name', cookieData.full_name);
      if (cookieData.system_user) params.append('erp_system_user', cookieData.system_user);
      if (cookieData.sid) params.append('erp_session_id', cookieData.sid);
      if (cookieData.user_image) params.append('erp_user_image', cookieData.user_image);
      
      // Add auto-login flag
      params.append('auto_login', 'true');
      params.append('auth_method', 'erp_cookies');
      params.append('_t', Date.now().toString());

      const authenticatedUrl = `${ravenBaseUrl}?${params.toString()}`;
      console.log('🔗 Built Raven URL with ERP cookie auth (direct)');
      return authenticatedUrl;
    }

  } catch (error) {
    console.error('❌ Error building Raven URL with cookie auth:', error);
    return `${ravenBaseUrl}/login`;
  }
};

/**
 * Validate ERP cookie data for authentication
 * @param {Object} cookieData - ERP cookie data
 * @returns {boolean} Whether the cookie data is valid for authentication
 */
export const validateERPCookieData = (cookieData) => {
  if (!cookieData) return false;
  
  // Check for essential authentication data
  const hasUserId = !!cookieData.user_id;
  const hasFullName = !!cookieData.full_name;
  const hasSessionId = !!cookieData.sid;
  
  const isValid = hasUserId && hasFullName && hasSessionId;
  
  console.log('✅ ERP Cookie validation:', {
    hasUserId,
    hasFullName,
    hasSessionId,
    isValid
  });
  
  return isValid;
};

/**
 * Get user information from ERP cookie data
 * @param {Object} cookieData - ERP cookie data
 * @returns {Object} User information object
 */
export const extractUserInfoFromCookies = (cookieData) => {
  if (!cookieData) return null;

  try {
    // Decode URL-encoded values
    const fullName = cookieData.full_name ? decodeURIComponent(cookieData.full_name) : null;
    const userId = cookieData.user_id ? decodeURIComponent(cookieData.user_id) : null;
    
    return {
      fullName,
      userId,
      email: userId, // user_id typically contains the email
      systemUser: cookieData.system_user === 'yes',
      sessionId: cookieData.sid,
      userImage: cookieData.user_image
    };
  } catch (error) {
    console.error('❌ Error extracting user info from cookies:', error);
    return null;
  }
};

/**
 * Check if ERP cookies are available and valid
 * @returns {boolean} Whether ERP cookies are available for authentication
 */
export const isERPCookieAuthAvailable = () => {
  const cookieData = getERPCookieData();
  return validateERPCookieData(cookieData);
};

/**
 * Check if user has already authenticated with Raven
 * @returns {boolean} Whether user has Raven authentication
 */
export const hasRavenAuthentication = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for Raven-specific cookies or localStorage
    const ravenAuth = localStorage.getItem('ravenAuthenticated');
    const ravenSession = localStorage.getItem('ravenSessionId');
    const ravenUser = localStorage.getItem('ravenUser');
    
    return !!(ravenAuth === 'true' && ravenSession && ravenUser);
  } catch (error) {
    console.error('❌ Error checking Raven authentication:', error);
    return false;
  }
};

/**
 * Set Raven authentication status
 * @param {boolean} authenticated - Whether user is authenticated
 * @param {Object} userData - User data to store
 */
export const setRavenAuthentication = (authenticated, userData = null) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (authenticated) {
      localStorage.setItem('ravenAuthenticated', 'true');
      localStorage.setItem('ravenSessionId', Date.now().toString());
      if (userData) {
        localStorage.setItem('ravenUser', JSON.stringify(userData));
      }
      console.log('✅ Raven authentication status set to true');
    } else {
      localStorage.removeItem('ravenAuthenticated');
      localStorage.removeItem('ravenSessionId');
      localStorage.removeItem('ravenUser');
      console.log('❌ Raven authentication status cleared');
    }
  } catch (error) {
    console.error('❌ Error setting Raven authentication:', error);
  }
};

/**
 * Get Raven authentication data
 * @returns {Object|null} Raven authentication data or null
 */
export const getRavenAuthentication = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const ravenAuth = localStorage.getItem('ravenAuthenticated');
    const ravenSession = localStorage.getItem('ravenSessionId');
    const ravenUser = localStorage.getItem('ravenUser');
    
    if (ravenAuth === 'true' && ravenSession && ravenUser) {
      return {
        authenticated: true,
        sessionId: ravenSession,
        user: JSON.parse(ravenUser)
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting Raven authentication:', error);
    return null;
  }
};

/**
 * Monitor ERP cookie changes for authentication updates
 * @param {Function} callback - Callback function to execute when cookies change
 * @returns {Function} Cleanup function to stop monitoring
 */
export const monitorERPCookieChanges = (callback) => {
  if (typeof window === 'undefined') return () => {};

  let lastCookieData = null;

  const checkCookies = () => {
    const currentCookieData = getERPCookieData();
    
    // Check if cookie data has changed
    if (JSON.stringify(currentCookieData) !== JSON.stringify(lastCookieData)) {
      lastCookieData = currentCookieData;
      callback(currentCookieData);
    }
  };

  // Check cookies periodically
  const interval = setInterval(checkCookies, 1000);

  // Initial check
  checkCookies();

  // Return cleanup function
  return () => clearInterval(interval);
};
