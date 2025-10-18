# Background ERP Login System

This implementation provides seamless ERP authentication that happens in the background without interrupting the user's workflow. The ERP login process is completely transparent to the user.

## 🔄 How Background ERP Login Works

### 1. **Initial Check**
When a user visits a page with Raven components:
- System checks if user is already logged into `erp.elbrit.org`
- If logged in, extracts ERP cookie data and proceeds
- If not logged in, starts background ERP login process

### 2. **Background Process**
Instead of redirecting the user away from the current site:
- A hidden iframe is created and loads the ERP login page
- The iframe is positioned off-screen and is invisible to the user
- User can continue using the current application normally

### 3. **Automatic Monitoring**
The system continuously monitors:
- ERP cookie changes in the browser
- Login status updates
- Cookie data availability
- Authentication state changes

### 4. **Cookie Data Management**
- Fresh ERP cookies are extracted when available
- Cookie data is stored in localStorage for persistence
- Stored data is used as fallback if fresh cookies aren't available
- Data is validated and user information is extracted

## 🧩 Components

### BackgroundERPLogin Component
Handles the actual background ERP login process:
```javascript
<BackgroundERPLogin
  onERPLoginSuccess={(cookieData, userInfo) => {
    // Handle successful ERP login
  }}
  onERPLoginError={(error) => {
    // Handle ERP login errors
  }}
  checkInterval={5000} // Check every 5 seconds
  maxRetries={3}
/>
```

### ERPLoginHandler Component
Manages the overall ERP login flow and UI states:
```javascript
<ERPLoginHandler
  onERPLoginSuccess={(cookieData, userInfo) => {
    // Handle successful ERP login
  }}
  onERPLoginError={(error) => {
    // Handle ERP login errors
  }}
  enableBackgroundLogin={true}
  showLoading={true}
>
  {/* Your content here */}
</ERPLoginHandler>
```

### Updated Raven Components
Both `RavenAutoLogin` and `RavenEmbed` now use background ERP login:
- Automatically wrapped with `ERPLoginHandler`
- Handle ERP login success/error callbacks
- Use ERP cookie data for authentication
- Provide seamless user experience

## 🎯 User Experience

### Before (Redirect Approach)
1. User visits page
2. System redirects to ERP login
3. User logs into ERP
4. User is redirected back
5. Raven authentication begins

### After (Background Approach)
1. User visits page
2. System shows loading state
3. Hidden iframe loads ERP login in background
4. User continues using the app normally
5. ERP authentication happens transparently
6. Raven authentication begins automatically

## 🔧 Technical Implementation

### Hidden Iframe Strategy
```javascript
<iframe
  ref={iframeRef}
  src="https://erp.elbrit.org/login"
  style={{
    width: '1px',
    height: '1px',
    border: 'none',
    position: 'absolute',
    top: '-1000px',
    left: '-1000px',
    visibility: 'hidden'
  }}
/>
```

### Cookie Monitoring
```javascript
const checkERPLoginStatus = useCallback(() => {
  const isLoggedIn = isUserLoggedIntoERP();
  if (isLoggedIn) {
    const cookieData = getERPCookieData();
    // Process cookie data...
  }
}, []);

// Check every 5 seconds
setInterval(checkERPLoginStatus, 5000);
```

### Data Storage
```javascript
// Store cookie data in localStorage
localStorage.setItem('erpCookieData', JSON.stringify({
  full_name: 'John Doe',
  user_id: 'john@example.com',
  sid: 'session123',
  lastUpdated: new Date().toISOString()
}));
```

## 📱 Visual States

### 1. **Checking State**
- Shows loading spinner
- "Checking ERP login status..."

### 2. **Background Process State**
- Shows background process indicator
- "Setting up ERP authentication in background..."
- "This happens automatically without interrupting your workflow"

### 3. **Success State**
- Shows success message
- "ERP authentication successful!"
- Displays user information

### 4. **Error State**
- Shows error message
- "Background ERP login will retry automatically"
- Continues retry attempts

## 🛡️ Error Handling

### Automatic Retry
- System retries ERP login automatically
- Configurable retry count (default: 3)
- Exponential backoff for retry intervals

### Fallback Mechanisms
- Uses stored cookie data if fresh cookies aren't available
- Graceful degradation if ERP login fails
- Continues monitoring for successful authentication

### User Feedback
- Clear status messages for each state
- Debug information in development mode
- Non-intrusive error handling

## 🔍 Debugging

### Development Mode
In development, a debug panel shows:
- Background ERP login status
- Retry count
- User information
- Real-time status updates

### Console Logging
Detailed console logs for:
- ERP login status checks
- Cookie data extraction
- Authentication state changes
- Error conditions

## 📋 Configuration Options

### BackgroundERPLogin Props
- `checkInterval`: How often to check for cookies (default: 5000ms)
- `maxRetries`: Maximum retry attempts (default: 3)
- `onERPLoginSuccess`: Success callback
- `onERPLoginError`: Error callback

### ERPLoginHandler Props
- `enableBackgroundLogin`: Enable background process (default: true)
- `showLoading`: Show loading states (default: true)
- `onERPLoginSuccess`: Success callback
- `onERPLoginError`: Error callback

## 🚀 Benefits

### For Users
- **Seamless Experience**: No interruptions to workflow
- **Transparent Process**: ERP login happens automatically
- **Immediate Access**: Can use the app while ERP authentication happens
- **No Manual Steps**: Everything happens automatically

### For Developers
- **Easy Integration**: Just wrap components with ERPLoginHandler
- **Robust Error Handling**: Automatic retries and fallbacks
- **Debug Support**: Comprehensive logging and debug tools
- **Flexible Configuration**: Customizable retry and check intervals

## 🔄 Complete Flow

1. **User visits page** → System checks ERP login status
2. **Not logged in?** → Background process starts automatically
3. **Hidden iframe loads** → ERP login page loads in background
4. **User continues working** → No interruption to user experience
5. **ERP cookies detected** → System extracts and stores cookie data
6. **Authentication complete** → Raven components initialize automatically
7. **Success state** → User sees success message and can use Raven

The entire process is seamless and transparent to the user, providing the best possible experience while ensuring proper ERP authentication for Raven access.
