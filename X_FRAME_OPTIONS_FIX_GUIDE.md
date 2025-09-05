# X-Frame-Options Fix Guide

## Problem
You're encountering the error: "Refused to display 'https://plamsic-app.netlify.app/' in a frame because it set 'X-Frame-Options' to 'deny'."

This error occurs when a website prevents itself from being embedded in iframes for security reasons.

## Solution Applied

### 1. Updated Next.js Configuration (`next.config.mjs`)

I've added comprehensive X-Frame-Options and Content Security Policy headers to allow iframe embedding:

#### Global Headers
- **X-Frame-Options**: Set to `SAMEORIGIN` for general pages
- **Content-Security-Policy**: Configured to allow embedding from:
  - Same origin (`'self'`)
  - Netlify apps (`https://*.netlify.app`)
  - Plasmic apps (`https://*.plasmic.app`)
  - Plasmic Studio (`https://studio.plasmic.app`)

#### Special Headers for Plasmic Host Page
- **X-Frame-Options**: Set to `ALLOWALL` for `/plasmic-host` route
- **Content-Security-Policy**: Set to allow all frame ancestors and sources

#### Catchall Route Headers
- Applied to all non-API routes to ensure Plasmic pages can be embedded

### 2. Configuration Details

```javascript
// Global headers for all routes
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',
},
{
  key: 'Content-Security-Policy',
  value: "frame-ancestors 'self' https://*.netlify.app https://*.plasmic.app https://studio.plasmic.app; frame-src 'self' https://*.netlify.app https://*.plasmic.app https://studio.plasmic.app;",
}

// Special headers for Plasmic host page
{
  source: '/plasmic-host',
  headers: [
    {
      key: 'X-Frame-Options',
      value: 'ALLOWALL',
    },
    {
      key: 'Content-Security-Policy',
      value: "frame-ancestors *; frame-src *;",
    },
  ],
}
```

## Testing the Fix

### 1. Restart Your Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Test iframe Embedding
You can test if the fix works by:

1. **Create a test HTML file** with an iframe:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Test</title>
</head>
<body>
    <h1>Testing iframe embedding</h1>
    <iframe 
        src="http://localhost:3000/plasmic-host" 
        width="100%" 
        height="600px"
        frameborder="0">
    </iframe>
</body>
</html>
```

2. **Open the test file** in your browser to verify the iframe loads without errors.

### 3. Check Browser Console
- Open Developer Tools (F12)
- Look for any remaining X-Frame-Options errors
- Check the Network tab to see if the headers are being applied correctly

## Additional Troubleshooting

### If the error persists:

1. **Check the exact URL** causing the issue:
   - The error mentions `plamsic-app.netlify.app` (note the typo: "plamsic" instead of "plasmic")
   - This might be a different app or a typo in your configuration

2. **Verify the source** of the iframe:
   - Check if you're trying to embed from a different domain
   - Ensure the iframe src is pointing to your local development server or deployed app

3. **Clear browser cache**:
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache and cookies

4. **Check deployment**:
   - If deploying to production, ensure the headers are applied there too
   - Some hosting platforms may override or modify headers

### For Production Deployment

If you're deploying to Netlify, Vercel, or another platform, you may need to:

1. **Add headers to your hosting platform**:
   - Netlify: Add `_headers` file in `public` folder
   - Vercel: Add `vercel.json` configuration
   - Other platforms: Check their documentation for header configuration

2. **Example `_headers` file for Netlify**:
```
/*
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: frame-ancestors 'self' https://*.netlify.app https://*.plasmic.app https://studio.plasmic.app;

/plasmic-host
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors *;
```

## Security Considerations

The configuration I've applied balances security with functionality:

- **SAMEORIGIN**: Allows embedding from the same domain
- **Specific domains**: Only allows trusted domains (Netlify, Plasmic)
- **Plasmic host page**: Allows all origins for development/studio purposes

If you need stricter security, you can:
- Remove `ALLOWALL` and specify exact domains
- Use more restrictive CSP policies
- Implement additional authentication checks

## Next Steps

1. **Test the fix** with your specific use case
2. **Deploy to production** if testing is successful
3. **Monitor** for any security issues
4. **Adjust headers** as needed based on your specific requirements

The X-Frame-Options error should now be resolved, allowing your Plasmic app to be embedded in iframes as needed.
