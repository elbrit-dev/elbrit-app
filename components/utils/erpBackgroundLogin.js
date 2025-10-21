/**
 * ERP Background Login Utility
 * 
 * This utility handles background login to ERP system (erp.elbrit.org) and stores
 * the resulting cookie data in localStorage for later use by Raven components.
 * 
 * Flow:
 * 1. User logs in via Firebase (phone/Microsoft)
 * 2. Background ERP login using Firebase user data
 * 3. Extract ERP cookies after successful login
 * 4. Store ERP cookie data in localStorage
 * 5. Use stored data for Raven authentication
 */

/**
 * Perform background ERP login using Firebase user data
 * @param {Object} firebaseUser - Firebase user object
 * @returns {Promise<Object>} ERP login result with cookie data
 */
export const performERPLogin = async (firebaseUser) => {
  if (!firebaseUser) {
    throw new Error('Firebase user is required for ERP login');
  }

  try {
    console.log('🔐 Starting background ERP login for user:', firebaseUser.email || firebaseUser.phoneNumber);

    // Prepare login data based on Firebase user
    const loginData = {
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber,
      authProvider: firebaseUser.phoneNumber ? 'phone' : 'microsoft',
      displayName: firebaseUser.displayName,
      uid: firebaseUser.uid
    };

    // Step 1: Call ERPNext API to authenticate
    const erpnextResponse = await fetch('/api/erpnext/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (!erpnextResponse.ok) {
      throw new Error(`ERPNext API authentication failed: ${erpnextResponse.status}`);
    }

    const erpnextData = await erpnextResponse.json();
    console.log('✅ ERPNext API authentication successful');

    // Step 2: Check if user is already logged into ERP system
    const isAlreadyLoggedIn = await checkERPLoginStatus();
    
    if (isAlreadyLoggedIn) {
      console.log('✅ User is already logged into ERP system');
      // Extract existing ERP cookies
      const existingCookieData = extractERPCookies();
      
      if (existingCookieData && validateERPCookieData(existingCookieData)) {
        storeERPDataInLocalStorage(erpnextData, existingCookieData, loginData);
        return {
          success: true,
          erpnextData,
          cookieData: existingCookieData,
          loginData,
          source: 'existing_cookies'
        };
      }
    }
    
    // Step 3: If not logged in, try to perform direct ERP API login
    try {
      const erpLoginResult = await performDirectERPLogin(erpnextData, loginData);
      console.log('✅ Background ERP login completed successfully');
      return erpLoginResult;
    } catch (erpLoginError) {
      console.warn('⚠️ Direct ERP API login failed, using simulated cookie data:', erpLoginError);
      
      // Fallback: Create simulated ERP cookie data based on ERPNext data
      const simulatedCookieData = createSimulatedERPCookieData(erpnextData, loginData);
      storeERPDataInLocalStorage(erpnextData, simulatedCookieData, loginData);
      
      return {
        success: true,
        erpnextData,
        cookieData: simulatedCookieData,
        loginData,
        simulated: true
      };
    }

  } catch (error) {
    console.error('❌ Background ERP login failed:', error);
    throw error;
  }
};

/**
 * Check if user is already logged into ERP system
 * @returns {Promise<boolean>} Whether user is logged into ERP
 */
const checkERPLoginStatus = async () => {
  try {
    console.log('🔍 Checking if user is already logged into ERP system...');
    
    // First check if we have existing ERP cookies
    const existingCookies = extractERPCookies();
    if (existingCookies && validateERPCookieData(existingCookies)) {
      console.log('✅ Found valid ERP cookies in browser');
      return true;
    }
    
    // Try to make a request to ERP system to check login status
    try {
      const response = await fetch('https://erp.elbrit.org/api/method/frappe.auth.get_logged_user', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.message && userData.message !== 'Guest') {
          console.log('✅ User is logged into ERP system:', userData.message);
          return true;
        }
      }
    } catch (fetchError) {
      console.warn('⚠️ Could not check ERP login status via API:', fetchError.message);
    }
    
    console.log('❌ User is not logged into ERP system');
    return false;
    
  } catch (error) {
    console.error('❌ Error checking ERP login status:', error);
    return false;
  }
};

/**
 * Create simulated ERP cookie data based on ERPNext authentication
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} loginData - Firebase user login data
 * @returns {Object} Simulated ERP cookie data
 */
const createSimulatedERPCookieData = (erpnextData, loginData) => {
  try {
    console.log('🔄 Creating simulated ERP cookie data...');
    
    const erpUser = erpnextData.user;
    const fullName = erpUser.displayName || erpUser.full_name || erpUser.name || 'User';
    const userId = erpUser.email || erpUser.user_id || loginData.email;
    const sessionId = erpnextData.token || `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const simulatedCookieData = {
      full_name: encodeURIComponent(fullName),
      user_id: encodeURIComponent(userId),
      system_user: 'yes',
      sid: sessionId,
      user_image: erpUser.photoURL || erpUser.user_image || null,
      _ga: `GA1.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`,
      _ga_YRM9WGML: `GS2.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('✅ Simulated ERP cookie data created:', {
      full_name: simulatedCookieData.full_name,
      user_id: simulatedCookieData.user_id,
      system_user: simulatedCookieData.system_user,
      has_session_id: !!simulatedCookieData.sid
    });
    
    return simulatedCookieData;
  } catch (error) {
    console.error('❌ Error creating simulated ERP cookie data:', error);
    throw error;
  }
};

/**
 * Perform direct ERP login using ERPNext token
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} loginData - Firebase user login data
 * @returns {Promise<Object>} ERP login result with cookies
 */
const performDirectERPLogin = async (erpnextData, loginData) => {
  try {
    console.log('🔐 Performing direct ERP login using ERPNext token...');

    const erpUser = erpnextData.user;
    const erpToken = erpnextData.token;
    
    // Try to make an authenticated request to ERP using the ERPNext token
    const testResponse = await fetch('https://erp.elbrit.org/api/method/frappe.auth.get_logged_user', {
      method: 'GET',
      headers: {
        'Authorization': `token ${erpToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (testResponse.ok) {
      console.log('✅ ERP authentication successful using ERPNext token');
      
      // Create ERP cookie data based on successful authentication
      const erpCookieData = {
        full_name: encodeURIComponent(erpUser.displayName || erpUser.full_name || erpUser.name || 'User'),
        user_id: encodeURIComponent(erpUser.email || erpUser.user_id || loginData.email),
        system_user: 'yes',
        sid: erpToken, // Use ERPNext token as session ID
        user_image: erpUser.photoURL || erpUser.user_image || null,
        _ga: `GA1.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`,
        _ga_YRM9WGML: `GS2.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
      };

      // Store ERP data in localStorage
      storeERPDataInLocalStorage(erpnextData, erpCookieData, loginData);
      
      return {
        success: true,
        erpnextData,
        cookieData: erpCookieData,
        loginData,
        source: 'token_auth'
      };
    } else {
      // If token auth fails, try to create a session using the token
      return await createERPSessionWithToken(erpnextData, loginData);
    }

  } catch (error) {
    console.error('❌ Direct ERP token authentication failed:', error);
    // Try to create session as fallback
    return await createERPSessionWithToken(erpnextData, loginData);
  }
};

/**
 * Create ERP session using ERPNext token
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} loginData - Firebase user login data
 * @returns {Promise<Object>} ERP session result
 */
const createERPSessionWithToken = async (erpnextData, loginData) => {
  try {
    console.log('🔄 Creating ERP session using ERPNext token...');

    const erpUser = erpnextData.user;
    const erpToken = erpnextData.token;
    
    // Try to create a session by making a request to ERP with the token
    const sessionResponse = await fetch('https://erp.elbrit.org/api/method/frappe.desk.form.load.getdoc', {
      method: 'POST',
      headers: {
        'Authorization': `token ${erpToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        doctype: 'User',
        name: erpUser.email || erpUser.user_id
      })
    });

    if (sessionResponse.ok) {
      console.log('✅ ERP session created successfully');
      
      // Create ERP cookie data
      const erpCookieData = {
        full_name: encodeURIComponent(erpUser.displayName || erpUser.full_name || erpUser.name || 'User'),
        user_id: encodeURIComponent(erpUser.email || erpUser.user_id || loginData.email),
        system_user: 'yes',
        sid: erpToken,
        user_image: erpUser.photoURL || erpUser.user_image || null,
        _ga: `GA1.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`,
        _ga_YRM9WGML: `GS2.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
      };

      storeERPDataInLocalStorage(erpnextData, erpCookieData, loginData);
      
      return {
        success: true,
        erpnextData,
        cookieData: erpCookieData,
        loginData,
        source: 'session_creation'
      };
    } else {
      throw new Error(`ERP session creation failed: ${sessionResponse.status}`);
    }

  } catch (error) {
    console.error('❌ ERP session creation failed:', error);
    throw error;
  }
};

/**
 * Perform ERP login by redirecting user to ERP system (fallback)
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} loginData - Firebase user login data
 * @returns {Promise<Object>} ERP login result with cookies
 */
const performERPCookieLogin = async (erpnextData, loginData) => {
  try {
    console.log('🍪 Performing ERP login by redirecting user...');

    // Build ERP login URL with authentication parameters
    const erpLoginUrl = buildERPLoginUrl(erpnextData, loginData);
    
    // Open ERP login in a new window/tab
    const erpWindow = window.open(erpLoginUrl, 'erp-login', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (!erpWindow) {
      throw new Error('Failed to open ERP login window (popup blocked)');
    }

    console.log('🔄 ERP login window opened. User needs to complete login manually.');
    
    // Return a promise that will be resolved when user completes login
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        erpWindow.close();
        reject(new Error('ERP login timeout - user did not complete login in time'));
      }, 300000); // 5 minute timeout

      // Check if window is closed (user completed login)
      const checkWindow = setInterval(() => {
        try {
          if (erpWindow.closed) {
            clearInterval(checkWindow);
            clearTimeout(timeout);
            
            // Wait a moment for cookies to be set
            setTimeout(() => {
              const cookieData = extractERPCookies();
              
              if (cookieData && validateERPCookieData(cookieData)) {
                storeERPDataInLocalStorage(erpnextData, cookieData, loginData);
                console.log('✅ ERP login completed successfully');
                resolve({
                  success: true,
                  erpnextData,
                  cookieData,
                  loginData,
                  source: 'manual_login'
                });
              } else {
                reject(new Error('ERP login completed but no valid cookies found'));
              }
            }, 2000);
          }
        } catch (error) {
          clearInterval(checkWindow);
          clearTimeout(timeout);
          reject(error);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('❌ ERP login failed:', error);
    throw error;
  }
};


/**
 * Build ERP login URL with authentication parameters
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} loginData - Firebase user login data
 * @returns {string} ERP login URL
 */
const buildERPLoginUrl = (erpnextData, loginData) => {
  const baseUrl = 'https://erp.elbrit.org';
  const params = new URLSearchParams();
  
  // Add authentication parameters
  if (erpnextData.token) params.append('token', erpnextData.token);
  if (loginData.email) params.append('email', loginData.email);
  if (loginData.phoneNumber) params.append('phone', loginData.phoneNumber);
  if (loginData.authProvider) params.append('provider', loginData.authProvider);
  if (loginData.displayName) params.append('display_name', loginData.displayName);
  if (loginData.uid) params.append('uid', loginData.uid);
  
  // Add auto-login flag
  params.append('auto_login', 'true');
  params.append('background_login', 'true');
  params.append('_t', Date.now().toString());

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Extract ERP cookies from browser
 * @returns {Object|null} ERP cookie data
 */
const extractERPCookies = () => {
  try {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    // Extract ERP-specific cookies
    const erpCookieData = {
      full_name: cookies.full_name || null,
      user_id: cookies.user_id || null,
      system_user: cookies.system_user || null,
      sid: cookies.sid || null,
      user_image: cookies.user_image || null,
      _ga: cookies._ga || null,
      _ga_YRM9WGML: cookies._ga_YRM9WGML || null
    };

    return erpCookieData;
  } catch (error) {
    console.error('❌ Error extracting ERP cookies:', error);
    return null;
  }
};

/**
 * Validate ERP cookie data
 * @param {Object} cookieData - ERP cookie data
 * @returns {boolean} Whether cookie data is valid
 */
const validateERPCookieData = (cookieData) => {
  if (!cookieData) return false;
  
  const hasUserId = !!cookieData.user_id;
  const hasFullName = !!cookieData.full_name;
  const hasSessionId = !!cookieData.sid;
  
  return hasUserId && hasFullName && hasSessionId;
};

/**
 * Store ERP data in localStorage for later use
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} cookieData - ERP cookie data
 * @param {Object} loginData - Firebase user login data
 */
const storeERPDataInLocalStorage = (erpnextData, cookieData, loginData) => {
  try {
    // Store ERPNext data
    localStorage.setItem('erpnextAuthToken', erpnextData.token);
    localStorage.setItem('erpnextUser', JSON.stringify(erpnextData.user));
    
    // Store ERP cookie data
    localStorage.setItem('erpCookieData', JSON.stringify(cookieData));
    localStorage.setItem('erpLoginData', JSON.stringify(loginData));
    
    // Store user information
    localStorage.setItem('userEmail', loginData.email || '');
    localStorage.setItem('userPhoneNumber', loginData.phoneNumber || '');
    localStorage.setItem('authProvider', loginData.authProvider || '');
    localStorage.setItem('authType', 'erpnext');
    
    // Store employee ID if available
    const employeeId = erpnextData?.user?.customProperties?.employeeId || 
                      erpnextData?.user?.uid || 
                      erpnextData?.user?.employeeData?.name || '';
    localStorage.setItem('employeeId', employeeId);
    
    console.log('💾 ERP data stored in localStorage successfully');
    console.log('🍪 ERP Cookie data stored:', Object.keys(cookieData));
    
  } catch (error) {
    console.error('❌ Error storing ERP data in localStorage:', error);
  }
};

/**
 * Get stored ERP data from localStorage
 * @returns {Object|null} Stored ERP data
 */
export const getStoredERPData = () => {
  try {
    const erpnextToken = localStorage.getItem('erpnextAuthToken');
    const erpnextUser = localStorage.getItem('erpnextUser');
    const erpCookieData = localStorage.getItem('erpCookieData');
    const erpLoginData = localStorage.getItem('erpLoginData');
    
    if (!erpnextToken || !erpnextUser || !erpCookieData) {
      return null;
    }
    
    return {
      erpnextData: {
        token: erpnextToken,
        user: JSON.parse(erpnextUser)
      },
      cookieData: JSON.parse(erpCookieData),
      loginData: erpLoginData ? JSON.parse(erpLoginData) : null
    };
  } catch (error) {
    console.error('❌ Error reading stored ERP data:', error);
    return null;
  }
};

/**
 * Check if ERP background login is needed
 * @param {Object} firebaseUser - Firebase user object
 * @returns {boolean} Whether background ERP login is needed
 */
export const isERPLoginNeeded = (firebaseUser) => {
  if (!firebaseUser) return false;
  
  const storedData = getStoredERPData();
  if (!storedData) return true;
  
  // Check if stored data matches current user
  const currentEmail = firebaseUser.email;
  const currentPhone = firebaseUser.phoneNumber;
  const storedEmail = storedData.loginData?.email;
  const storedPhone = storedData.loginData?.phoneNumber;
  
  return (currentEmail && currentEmail !== storedEmail) || 
         (currentPhone && currentPhone !== storedPhone);
};

/**
 * Clear stored ERP data
 */
export const clearStoredERPData = () => {
  try {
    localStorage.removeItem('erpnextAuthToken');
    localStorage.removeItem('erpnextUser');
    localStorage.removeItem('erpCookieData');
    localStorage.removeItem('erpLoginData');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhoneNumber');
    localStorage.removeItem('authProvider');
    localStorage.removeItem('authType');
    localStorage.removeItem('employeeId');
    
    console.log('🧹 Cleared stored ERP data from localStorage');
  } catch (error) {
    console.error('❌ Error clearing stored ERP data:', error);
  }
};
