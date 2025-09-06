# Plasmic Studio Sync Fix Guide

## Problem
After deploying to Netlify at `https://plamsic-app.netlify.app/`, Plasmic Studio cannot see newly added or registered code components when using `/plasmic-host` endpoint.

## Root Causes Identified

1. **Missing Netlify Configuration** ✅ FIXED
2. **Potential Build Issues** 
3. **Component Registration Issues**
4. **Caching Issues**

## Solutions Applied

### 1. Netlify Configuration (✅ FIXED)
- Created `netlify.toml` with proper Next.js configuration
- Added proper headers for iframe embedding
- Configured redirects for `/plasmic-host` endpoint

### 2. Debug Tools Added
- Created `/debug-components` page to verify component registration
- Enhanced `/plasmic-host` with debug logging

## Steps to Fix the Issue

### Step 1: Deploy the Fixed Configuration
1. Commit and push the changes to your repository
2. Ensure Netlify redeploys with the new `netlify.toml` configuration

### Step 2: Verify Component Registration
1. Visit `https://plamsic-app.netlify.app/debug-components`
2. Check if all your components are listed in the registry
3. If components are missing, there's a registration issue

### Step 3: Check Plasmic Host Endpoint
1. Visit `https://plamsic-app.netlify.app/plasmic-host`
2. Open browser console and check for:
   - "Plasmic Host loaded" message
   - Component registry object
   - Any error messages

### Step 4: Verify in Plasmic Studio
1. In Plasmic Studio, go to your project settings
2. Set the App Host URL to: `https://plamsic-app.netlify.app/plasmic-host`
3. Save the settings
4. Try to add a new code component

## Common Issues and Solutions

### Issue: Components not appearing in Studio
**Solution**: 
- Check if `plasmic-init.js` is properly imported in both `/plasmic-host` and your main app
- Ensure all components are registered before the PLASMIC loader is initialized
- Verify there are no JavaScript errors in the console

### Issue: Build errors preventing deployment
**Solution**:
- Check the build logs in Netlify dashboard
- Ensure all dependencies are properly installed
- Fix any syntax errors in `plasmic-init.js`

### Issue: Caching issues
**Solution**:
- Clear browser cache
- Force refresh the `/plasmic-host` page
- Check if Netlify is caching the old version

## Verification Checklist

- [ ] `netlify.toml` is deployed
- [ ] `/plasmic-host` loads without errors
- [ ] `/debug-components` shows all expected components
- [ ] Browser console shows component registry
- [ ] Plasmic Studio can access the host URL
- [ ] New components appear in Studio after registration

## Next Steps

1. Deploy the changes
2. Test the debug endpoints
3. Update Plasmic Studio settings
4. Try adding a new component
5. If issues persist, check the browser console for specific errors

## Additional Debugging

If the issue persists, check:
1. Network tab in browser dev tools for failed requests
2. Netlify function logs for server-side errors
3. Plasmic Studio console for connection errors
4. Ensure your Plasmic project ID and API token are correct
