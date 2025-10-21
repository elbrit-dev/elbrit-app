/**
 * ERP One-Time Credentials Management
 * 
 * This utility manages the permanent storage and retrieval of ERP credentials
 * after the user's one-time login. It provides functions to store, retrieve,
 * and validate ERP credentials for use with Raven chat.
 */

/**
 * Store ERP credentials permanently after one-time login
 * @param {Object} user - Firebase user object
 * @param {Object} erpCredentials - ERP login credentials
 */
export const storeERPCredentials = (user, erpCredentials) => {
  try {
    const storedData = {
      userId: user.uid,
      userEmail: user.email,
      erpCredentials: {
        email: erpCredentials.email,
        password: erpCredentials.password,
        sessionId: erpCredentials.sessionId,
        loginTime: erpCredentials.loginTime || new Date().toISOString(),
        rememberMe: erpCredentials.rememberMe || true
      },
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('erpOneTimeLoginData', JSON.stringify(storedData));
    console.log('💾 ERP credentials stored permanently for user:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to store ERP credentials:', error);
    return false;
  }
};

/**
 * Retrieve stored ERP credentials for the current user
 * @param {Object} user - Firebase user object
 * @returns {Object|null} Stored ERP credentials or null if not found
 */
export const getStoredERPCredentials = (user) => {
  if (!user) return null;

  try {
    const storedData = localStorage.getItem('erpOneTimeLoginData');
    if (!storedData) return null;

    const data = JSON.parse(storedData);
    
    // Check if credentials belong to current user
    if (data.userId === user.uid && data.erpCredentials) {
      console.log('✅ Found stored ERP credentials for user:', user.email);
      return data.erpCredentials;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to retrieve ERP credentials:', error);
    return null;
  }
};

/**
 * Check if user has stored ERP credentials
 * @param {Object} user - Firebase user object
 * @returns {boolean} True if user has stored credentials
 */
export const hasStoredERPCredentials = (user) => {
  return getStoredERPCredentials(user) !== null;
};

/**
 * Clear stored ERP credentials
 * @param {Object} user - Firebase user object (optional)
 */
export const clearERPCredentials = (user) => {
  try {
    if (user) {
      // Clear only for specific user
      const storedData = localStorage.getItem('erpOneTimeLoginData');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.userId === user.uid) {
          localStorage.removeItem('erpOneTimeLoginData');
          console.log('🗑️ ERP credentials cleared for user:', user.email);
        }
      }
    } else {
      // Clear for all users
      localStorage.removeItem('erpOneTimeLoginData');
      console.log('🗑️ All ERP credentials cleared');
    }
  } catch (error) {
    console.error('❌ Failed to clear ERP credentials:', error);
  }
};

/**
 * Update last used timestamp for ERP credentials
 * @param {Object} user - Firebase user object
 */
export const updateLastUsed = (user) => {
  try {
    const storedData = localStorage.getItem('erpOneTimeLoginData');
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.userId === user.uid) {
        data.lastUsed = new Date().toISOString();
        localStorage.setItem('erpOneTimeLoginData', JSON.stringify(data));
      }
    }
  } catch (error) {
    console.error('❌ Failed to update last used timestamp:', error);
  }
};

/**
 * Create ERP cookie data from stored credentials
 * @param {Object} user - Firebase user object
 * @param {Object} erpCredentials - Stored ERP credentials
 * @returns {Object} ERP cookie data for Raven
 */
export const createERPCookieData = (user, erpCredentials) => {
  return {
    sid: erpCredentials.sessionId || `erp_${Date.now()}`,
    user_id: erpCredentials.email,
    full_name: user.displayName || user.email?.split('@')[0] || 'User',
    system_user: 'yes',
    user_image: user.photoURL || ''
  };
};

/**
 * Validate stored ERP credentials by testing login
 * @param {Object} erpCredentials - Stored ERP credentials
 * @returns {Promise<boolean>} True if credentials are still valid
 */
export const validateERPCredentials = async (erpCredentials) => {
  try {
    console.log('🔍 Validating stored ERP credentials...');
    
    const response = await fetch('https://erp.elbrit.org/api/method/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        usr: erpCredentials.email,
        pwd: erpCredentials.password,
        device: 'web'
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.message === 'Logged In') {
        console.log('✅ Stored ERP credentials are still valid');
        return true;
      }
    }

    console.warn('⚠️ Stored ERP credentials are no longer valid');
    return false;
  } catch (error) {
    console.warn('⚠️ Failed to validate ERP credentials:', error);
    return false;
  }
};

/**
 * Get ERP login status for user
 * @param {Object} user - Firebase user object
 * @returns {Object} Login status information
 */
export const getERPLoginStatus = (user) => {
  const credentials = getStoredERPCredentials(user);
  
  return {
    hasCredentials: credentials !== null,
    credentials: credentials,
    needsLogin: credentials === null,
    lastUsed: credentials ? credentials.loginTime : null
  };
};
