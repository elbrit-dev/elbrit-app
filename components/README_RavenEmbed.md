# RavenEmbed Component

A React component that embeds the Raven chat application directly into your Plasmic app using an iframe with seamless auto-login functionality.

## 🎯 Features

- **Seamless Auto-Login**: Automatically logs users into Raven using stored authentication credentials
- **iframe Integration**: Embeds the full Raven web app (like Raven Mobile) directly in your app
- **Authentication Integration**: Uses your existing ERPNext authentication system
- **Error Handling**: Robust error handling with retry mechanism
- **Loading States**: Beautiful loading indicators while Raven loads
- **Responsive Design**: Fully responsive and customizable

## 🔧 How It Works

1. **Reads Authentication Data**: Automatically reads user credentials from localStorage:
   - `erpnextAuthToken` - Your ERPNext authentication token
   - `erpnextUser` - User data
   - `userEmail` - User's email address
   - `userPhoneNumber` - User's phone number
   - `authProvider` - Authentication provider (microsoft/phone)

2. **Builds Authenticated URL**: Constructs Raven URL with authentication parameters:
   ```
   https://raven.elbrit.in/app?token=YOUR_TOKEN&email=user@email.com&provider=microsoft&_t=timestamp
   ```

3. **Embeds Raven**: Loads the actual Raven web app in an iframe with full functionality

## 📋 Setup Instructions

### Step 1: Register Component in Plasmic

Add this to your `plasmic-init.js` file:

```javascript
import RavenEmbed from '../components/RavenEmbed';

// Register the component
PLASMIC.registerComponent(RavenEmbed, {
  name: "RavenEmbed",
  displayName: "Raven Chat Embed",
  description: "Embeds Raven chat application with auto-login",
  props: {
    ravenUrl: {
      type: "string",
      defaultValue: "https://raven.elbrit.in",
      description: "Raven application URL"
    },
    height: {
      type: "string", 
      defaultValue: "90vh",
      description: "Height of the iframe"
    },
    width: {
      type: "string",
      defaultValue: "100%", 
      description: "Width of the iframe"
    },
    showLoading: {
      type: "boolean",
      defaultValue: true,
      description: "Show loading indicator"
    },
    className: {
      type: "string",
      description: "Additional CSS classes"
    }
  }
});
```

### Step 2: Use in Plasmic Studio

1. **Open your Plasmic project** in Plasmic Studio
2. **Drag and drop** the "Raven Chat Embed" component onto your page
3. **Configure properties** as needed:
   - Set custom height/width
   - Adjust Raven URL if different
   - Add CSS classes for styling

### Step 3: Test Integration

1. **Login to your app** using Microsoft SSO or phone authentication
2. **Navigate to the page** with the Raven embed
3. **Verify auto-login** - you should be automatically logged into Raven
4. **Test chat functionality** - send messages, create channels, etc.

## 🎨 Customization Options

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ravenUrl` | string | "https://raven.elbrit.in" | Base URL for Raven application |
| `height` | string | "90vh" | Height of the iframe |
| `width` | string | "100%" | Width of the iframe |
| `showLoading` | boolean | true | Show loading indicator |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Additional inline styles |
| `onLoad` | function | null | Callback when iframe loads |
| `onError` | function | null | Callback when iframe errors |

### Example Usage

```jsx
// Basic usage
<RavenEmbed />

// Custom height and styling
<RavenEmbed 
  height="600px"
  className="my-raven-chat"
  style={{ border: '2px solid #007bff' }}
/>

// With callbacks
<RavenEmbed 
  onLoad={() => console.log('Raven loaded!')}
  onError={() => console.log('Raven failed to load')}
/>
```

## 🔐 Authentication Flow

```
User logs into your app
       │
       ▼
ERPNext authentication → stores token in localStorage
       │
       ▼
RavenEmbed component reads localStorage
       │
       ▼
Builds authenticated Raven URL with token
       │
       ▼
Embeds Raven iframe with auto-login
       │
       ▼
User is automatically logged into Raven
```

## 🚨 Security Considerations

1. **Token Security**: The authentication token is passed via URL parameters. Ensure:
   - Raven backend validates tokens properly
   - URLs are not logged in server logs
   - Use HTTPS for all communications

2. **iframe Security**: The component uses appropriate sandbox attributes:
   - `allow-same-origin` - For Raven to access its own resources
   - `allow-scripts` - For Raven's JavaScript functionality
   - `allow-forms` - For chat input forms
   - `allow-popups` - For Raven's popup features

3. **CORS Configuration**: Ensure Raven allows iframe embedding:
   - Set `X-Frame-Options: ALLOW` in Raven's headers
   - Configure CSP to allow your domain

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication data not found"**
   - Ensure user is logged in to your app first
   - Check that localStorage contains `erpnextAuthToken`

2. **"Failed to load Raven chat"**
   - Verify Raven URL is correct and accessible
   - Check browser console for CORS errors
   - Ensure Raven allows iframe embedding

3. **Auto-login not working**
   - Verify token format is correct
   - Check Raven backend token validation
   - Ensure Raven accepts token via URL parameter

### Debug Mode

Enable debug logging by opening browser console. The component logs:
- Authentication data found
- Raven URL being built
- Load/error events
- Retry attempts

## 🔄 Auto-Login Implementation

The component supports two auto-login approaches:

### Option 1: Token-based (Current Implementation)
- Passes ERPNext token via URL parameter
- Raven backend validates token and creates session
- Requires Raven backend modification for token login

### Option 2: Cookie-based (Alternative)
- If Raven and your app share the same domain
- ERPNext session cookie automatically sent to Raven
- No URL parameter passing needed

## 📱 Mobile Compatibility

- **Responsive Design**: Works on desktop and mobile devices
- **Touch Support**: Full touch interaction support
- **Viewport Optimization**: Adapts to different screen sizes

## 🎉 Benefits

✅ **Real Raven Experience**: Full Raven functionality, not a limited version  
✅ **Seamless Integration**: Users feel like they're using one unified app  
✅ **No Re-implementation**: Use existing Raven features without rebuilding  
✅ **Auto-Login**: No need to re-enter credentials  
✅ **Mobile Ready**: Works on all devices  
✅ **Customizable**: Full control over appearance and behavior  

## 🚀 Next Steps

1. **Register the component** in `plasmic-init.js`
2. **Add to your Plasmic pages** where you want chat functionality
3. **Test with your users** to ensure smooth experience
4. **Customize styling** to match your app's design
5. **Monitor performance** and user feedback

---

**Ready to embed Raven chat directly into your Plasmic app!** 🎯
