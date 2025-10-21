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
 * Build Raven authentication URL using ERP cookie data
 * @param {string} ravenBaseUrl - Base URL for Raven
 * @param {Object} cookieData - ERP cookie data
 * @returns {string} Authenticated Raven URL
 */
export const buildRavenUrlWithCookieAuth = (ravenBaseUrl, cookieData) => {
  if (!cookieData || !ravenBaseUrl) {
    return `${ravenBaseUrl}/login`;
  }

  try {
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
    console.log('🔗 Built Raven URL with ERP cookie auth');
    return authenticatedUrl;

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
 * Get ERP cookie data from localStorage (stored by ERPLogin component)
 * @returns {Object|null} Stored cookie data or null if not available
 */
export const getStoredERPCookieData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedData = localStorage.getItem('erpCookieData');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('❌ Error reading stored ERP cookie data:', error);
    return null;
  }
};

/**
 * Get stored ERP user info from localStorage
 * @returns {Object|null} Stored user info or null if not available
 */
export const getStoredERPUserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUserInfo = localStorage.getItem('erpUserInfo');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  } catch (error) {
    console.error('❌ Error reading stored ERP user info:', error);
    return null;
  }
};

/**
 * Check if stored ERP data is available and recent
 * @param {number} maxAgeMinutes - Maximum age in minutes (default: 30)
 * @returns {boolean} Whether stored data is available and recent
 */
export const isStoredERPDataValid = (maxAgeMinutes = 30) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const loginTime = localStorage.getItem('erpLoginTime');
    if (!loginTime) return false;
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const ageMinutes = (now - loginDate) / (1000 * 60);
    
    return ageMinutes <= maxAgeMinutes;
  } catch (error) {
    console.error('❌ Error checking stored ERP data validity:', error);
    return false;
  }
};

/**
 * Get ERP authentication data (tries stored data first, then live cookies)
 * @param {number} maxAgeMinutes - Maximum age for stored data in minutes
 * @returns {Object|null} Authentication data or null if not available
 */
export const getERPAuthData = (maxAgeMinutes = 30) => {
  // First try stored data if it's recent
  if (isStoredERPDataValid(maxAgeMinutes)) {
    const storedCookies = getStoredERPCookieData();
    const storedUserInfo = getStoredERPUserInfo();
    
    if (storedCookies && storedUserInfo) {
      console.log('🍪 Using stored ERP data');
      return {
        cookieData: storedCookies,
        userInfo: storedUserInfo,
        source: 'localStorage'
      };
    }
  }
  
  // Fallback to live cookie data
  const liveCookies = getERPCookieData();
  if (liveCookies && validateERPCookieData(liveCookies)) {
    const userInfo = extractUserInfoFromCookies(liveCookies);
    if (userInfo) {
      console.log('🍪 Using live ERP cookie data');
      return {
        cookieData: liveCookies,
        userInfo: userInfo,
        source: 'cookies'
      };
    }
  }
  
  console.log('⚠️ No valid ERP authentication data available');
  return null;
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
