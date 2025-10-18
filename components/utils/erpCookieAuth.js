/**
 * ERP Cookie Authentication Utility
 * 
 * This utility:
 * 1. Checks if user is logged into erp.elbrit.org
 * 2. Extracts ERP cookie data from the browser
 * 3. Stores cookie data in localStorage for future use
 * 4. Uses cookie data for Raven authentication
 * 
 * Since both Raven and ERP share the same cookie domain (.elbrit.org), this ensures
 * proper user identification and authentication.
 */

/**
 * Check if user is logged into ERP system
 * @returns {boolean} Whether user is logged into erp.elbrit.org
 */
export const isUserLoggedIntoERP = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if we have ERP cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    // Check for essential ERP authentication cookies
    const hasUserData = cookies.user_id && cookies.full_name && cookies.sid;
    
    console.log('🔍 ERP Login Status Check:', {
      hasUserData,
      user_id: cookies.user_id ? 'available' : 'missing',
      full_name: cookies.full_name ? 'available' : 'missing',
      sid: cookies.sid ? 'available' : 'missing'
    });

    return hasUserData;
  } catch (error) {
    console.error('❌ Error checking ERP login status:', error);
    return false;
  }
};

/**
 * Get ERP cookie data from browser and store in localStorage
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
      _ga_YRM9WGML: cookies._ga_YRM9WGML || null,
      // Add timestamp for tracking
      lastUpdated: new Date().toISOString()
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

    // Store cookie data in localStorage for future use
    if (hasEssentialData) {
      try {
        localStorage.setItem('erpCookieData', JSON.stringify(erpCookieData));
        console.log('💾 ERP cookie data stored in localStorage');
      } catch (storageError) {
        console.warn('⚠️ Could not store ERP cookie data in localStorage:', storageError);
      }
    }

    return hasEssentialData ? erpCookieData : null;

  } catch (error) {
    console.error('❌ Error extracting ERP cookie data:', error);
    return null;
  }
};

/**
 * Get ERP cookie data from localStorage (fallback)
 * @returns {Object|null} Stored cookie data or null if not available
 */
export const getStoredERPCookieData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedData = localStorage.getItem('erpCookieData');
    if (storedData) {
      const cookieData = JSON.parse(storedData);
      
      // Check if data is not too old (24 hours)
      const lastUpdated = new Date(cookieData.lastUpdated);
      const now = new Date();
      const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        console.log('📦 Using stored ERP cookie data');
        return cookieData;
      } else {
        console.log('⏰ Stored ERP cookie data is too old, clearing...');
        localStorage.removeItem('erpCookieData');
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error reading stored ERP cookie data:', error);
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
 * Redirect user to ERP login page
 * @param {string} returnUrl - URL to return to after login (optional)
 */
export const redirectToERPLogin = (returnUrl = null) => {
  if (typeof window === 'undefined') return;
  
  const erpLoginUrl = 'https://erp.elbrit.org/login';
  const redirectUrl = returnUrl || window.location.href;
  
  console.log('🔄 Redirecting to ERP login:', erpLoginUrl);
  console.log('🔙 Return URL after login:', redirectUrl);
  
  // Store return URL in localStorage for after login
  if (returnUrl) {
    localStorage.setItem('erpLoginReturnUrl', returnUrl);
  }
  
  // Redirect to ERP login
  window.location.href = erpLoginUrl;
};

/**
 * Check if ERP cookies are available and valid
 * @returns {boolean} Whether ERP cookies are available for authentication
 */
export const isERPCookieAuthAvailable = () => {
  // First try to get fresh cookie data
  let cookieData = getERPCookieData();
  
  // If no fresh data, try stored data
  if (!cookieData) {
    cookieData = getStoredERPCookieData();
  }
  
  return validateERPCookieData(cookieData);
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
