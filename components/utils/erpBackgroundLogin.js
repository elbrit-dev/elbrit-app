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

    // Step 2: Perform actual ERP login to get cookies
    const erpLoginResult = await performERPCookieLogin(erpnextData, loginData);
    
    console.log('✅ Background ERP login completed successfully');
    return erpLoginResult;

  } catch (error) {
    console.error('❌ Background ERP login failed:', error);
    throw error;
  }
};

/**
 * Perform ERP cookie login by making a request to ERP system
 * @param {Object} erpnextData - Data from ERPNext API
 * @param {Object} loginData - Firebase user login data
 * @returns {Promise<Object>} ERP login result with cookies
 */
const performERPCookieLogin = async (erpnextData, loginData) => {
  try {
    console.log('🍪 Performing ERP cookie login...');

    // Create a hidden iframe to perform ERP login
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    // Build ERP login URL with authentication parameters
    const erpLoginUrl = buildERPLoginUrl(erpnextData, loginData);
    iframe.src = erpLoginUrl;
    
    document.body.appendChild(iframe);

    // Wait for iframe to load and extract cookies
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        reject(new Error('ERP login timeout'));
      }, 10000); // 10 second timeout

      iframe.onload = () => {
        clearTimeout(timeout);
        
        try {
          // Extract cookies after iframe loads
          const cookieData = extractERPCookies();
          
          if (cookieData && validateERPCookieData(cookieData)) {
            // Store ERP data in localStorage
            storeERPDataInLocalStorage(erpnextData, cookieData, loginData);
            
            document.body.removeChild(iframe);
            resolve({
              success: true,
              erpnextData,
              cookieData,
              loginData
            });
          } else {
            document.body.removeChild(iframe);
            reject(new Error('Failed to extract valid ERP cookies'));
          }
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        reject(new Error('ERP login iframe failed to load'));
      };
    });

  } catch (error) {
    console.error('❌ ERP cookie login failed:', error);
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
