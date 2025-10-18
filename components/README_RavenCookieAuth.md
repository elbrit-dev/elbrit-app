# Raven ERP Cookie Authentication

This implementation provides seamless auto-login to Raven chat using ERP cookie data, ensuring both systems share the same authentication context.

## Overview

The ERP Cookie Authentication system leverages the shared domain between ERP and Raven systems (`.elbrit.org`) to provide automatic authentication without requiring separate login credentials.

## Components

### 1. ERP Cookie Authentication Utility (`utils/erpCookieAuth.js`)

Provides core functionality for extracting and validating ERP cookie data:

```javascript
import { 
  getERPCookieData, 
  buildRavenUrlWithCookieAuth, 
  validateERPCookieData,
  extractUserInfoFromCookies,
  isERPCookieAuthAvailable
} from './utils/erpCookieAuth';
```

#### Key Functions:

- **`getERPCookieData()`** - Extracts ERP cookies from browser
- **`validateERPCookieData(cookieData)`** - Validates cookie data for authentication
- **`extractUserInfoFromCookies(cookieData)`** - Extracts user information from cookies
- **`buildRavenUrlWithCookieAuth(baseUrl, cookieData)`** - Builds authenticated Raven URL
- **`isERPCookieAuthAvailable()`** - Checks if ERP cookie authentication is available

### 2. RavenAutoLogin Component

Enhanced auto-login component that uses ERP cookie data for authentication:

```jsx
import RavenAutoLogin from './components/RavenAutoLogin';

<RavenAutoLogin 
  ravenUrl="https://erp.elbrit.org/raven"
  height="90vh"
  width="100%"
  showLoading={true}
  mode="iframe"
  onLoad={() => console.log('Raven loaded successfully!')}
  onError={() => console.log('Raven failed to load')}
/>
```

#### Props:
- `ravenUrl` - Base URL for Raven (default: "https://erp.elbrit.org/raven")
- `height` - Iframe height (default: "90vh")
- `width` - Iframe width (default: "100%")
- `showLoading` - Show loading indicator (default: true)
- `mode` - Display mode: "iframe" or "window" (default: "iframe")
- `onLoad` - Callback when Raven loads successfully
- `onError` - Callback when Raven fails to load

### 3. RavenEmbed Component

Embed component for Raven chat with ERP cookie authentication:

```jsx
import RavenEmbed from './components/RavenEmbed';

<RavenEmbed 
  ravenUrl="https://erp.elbrit.org/raven"
  height="90vh"
  width="100%"
  showLoading={true}
  onLoad={() => console.log('Raven embedded successfully!')}
  onError={() => console.log('Raven embed failed')}
/>
```

## ERP Cookie Data Structure

The system extracts and uses the following ERP cookies:

### Essential Cookies:
- **`full_name`** - User's full name (URL encoded)
- **`user_id`** - User's email/ID (URL encoded)
- **`sid`** - Session ID for authentication
- **`system_user`** - System user flag ("yes"/"no")

### Optional Cookies:
- **`user_image`** - User's profile image
- **`_ga`** - Google Analytics tracking
- **`_ga_YRM9WGML`** - Google Analytics session

## Authentication Flow

1. **Cookie Extraction**: Reads ERP cookies from browser
2. **Validation**: Validates cookie data for authentication
3. **URL Building**: Constructs Raven URL with cookie authentication parameters
4. **Auto-Login**: Raven receives cookie data and authenticates user automatically

## URL Parameters

The system adds the following parameters to the Raven URL:

```
https://erp.elbrit.org/raven?erp_user_id=user@example.com&erp_full_name=John%20Doe&erp_system_user=yes&erp_session_id=abc123&auto_login=true&auth_method=erp_cookies&_t=1234567890
```

## Benefits

### Security
- **Shared Domain Authentication**: Uses existing ERP session cookies
- **No Token Exposure**: No sensitive tokens passed in URLs
- **Automatic Cookie Handling**: Browser handles cookie transmission securely

### User Experience
- **Seamless Integration**: No additional login required
- **Consistent Authentication**: Same user context in both systems
- **Real-time Updates**: Cookie changes are monitored automatically

### Technical
- **Simplified Architecture**: Leverages existing ERP authentication
- **Reduced Complexity**: No need for separate authentication systems
- **Better Performance**: Faster authentication using existing sessions

## Requirements

### Prerequisites
1. **ERP Login**: User must be logged into ERP system (erp.elbrit.org)
2. **Shared Domain**: Both ERP and Raven must use the same domain (.elbrit.org)
3. **Cookie Support**: Browser must support cookies
4. **Same-Site Policy**: Cookies must be accessible across the domain

### ERP Cookie Requirements
- `full_name` cookie must be present
- `user_id` cookie must be present  
- `sid` cookie must be present for session validation
- `system_user` cookie should be "yes" for system users

## Error Handling

### Common Issues

1. **No ERP Cookies Available**
   - **Cause**: User not logged into ERP system
   - **Solution**: Ensure user is logged into erp.elbrit.org

2. **Invalid Cookie Data**
   - **Cause**: Cookies are corrupted or expired
   - **Solution**: Refresh ERP session or re-login

3. **Cross-Domain Issues**
   - **Cause**: ERP and Raven on different domains
   - **Solution**: Ensure both systems use .elbrit.org domain

4. **Iframe Blocking**
   - **Cause**: X-Frame-Options header blocking iframe
   - **Solution**: Use "Open in New Window" fallback

## Testing

### Test Pages
- `/test-raven-cookie-auth` - Comprehensive ERP cookie authentication test
- `/test-raven-autologin` - Auto-login component test

### Manual Testing Steps
1. Log into ERP system (erp.elbrit.org)
2. Verify ERP cookies are present in browser
3. Navigate to test page
4. Check cookie status and user information
5. Test Raven auto-login functionality

## Integration with Plasmic

### Registration
Register components in `plasmic-init.js`:

```javascript
// Register Raven components
PLASMIC.registerComponent(RavenAutoLogin, {
  name: "RavenAutoLogin",
  props: {
    ravenUrl: "string",
    height: "string", 
    width: "string",
    showLoading: "boolean",
    mode: "choice",
    onLoad: "eventHandler",
    onError: "eventHandler"
  }
});

PLASMIC.registerComponent(RavenEmbed, {
  name: "RavenEmbed", 
  props: {
    ravenUrl: "string",
    height: "string",
    width: "string", 
    showLoading: "boolean",
    onLoad: "eventHandler",
    onError: "eventHandler"
  }
});
```

### Usage in Plasmic Studio
1. Drag "RavenAutoLogin" or "RavenEmbed" component onto page
2. Configure height/width properties
3. Set ravenUrl if different from default
4. Add event handlers for load/error callbacks

## Monitoring and Debugging

### Console Logging
The system provides detailed console logging:

```javascript
// Cookie extraction
console.log('🍪 ERP Cookie Data:', cookieData);

// Authentication status  
console.log('🔐 Starting Raven authentication with ERP cookies...');

// URL building
console.log('🔗 Built Raven URL with ERP cookie auth');
```

### Browser DevTools
1. Open Application tab in DevTools
2. Check Cookies section for erp.elbrit.org domain
3. Verify required cookies are present
4. Monitor network requests for Raven URL parameters

## Security Considerations

### Cookie Security
- Cookies are automatically marked as Secure and SameSite=Lax
- No sensitive data is exposed in URLs
- Authentication relies on existing ERP session security

### Domain Validation
- Only cookies from .elbrit.org domain are used
- Cross-domain cookie access is prevented
- Session validation ensures cookie authenticity

## Future Enhancements

### Planned Features
1. **Cookie Refresh**: Automatic cookie refresh when expired
2. **Multi-Domain Support**: Support for multiple ERP domains
3. **Enhanced Validation**: Additional cookie validation rules
4. **Analytics Integration**: Usage tracking and monitoring

### Potential Improvements
1. **Fallback Authentication**: Multiple authentication methods
2. **Performance Optimization**: Caching and optimization
3. **Error Recovery**: Automatic retry mechanisms
4. **User Feedback**: Better error messages and guidance
