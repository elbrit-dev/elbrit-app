/**
 * Raven Auto-Login API Endpoint
 * 
 * This endpoint handles auto-login for Raven chat application by:
 * 1. Validating the ERPNext authentication token
 * 2. Creating a Frappe session for Raven
 * 3. Redirecting to Raven with proper authentication
 * 
 * Usage:
 * GET /api/raven/auth?token=YOUR_TOKEN&email=user@email.com&provider=microsoft
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, email, phone, provider } = req.query;

    console.log('🔐 Raven Auth Request:', {
      hasToken: !!token,
      email: email,
      phone: phone,
      provider: provider
    });

    // Validate required parameters
    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ error: 'Authentication token is required' });
    }

    // Validate token format (should be base64 encoded)
    let decodedToken;
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      console.log('🔓 Decoded token:', decodedToken);
    } catch (error) {
      console.log('❌ Invalid token format:', error.message);
      return res.status(400).json({ error: 'Invalid token format' });
    }

    // Parse token (format: uid:timestamp)
    const [uid, timestamp] = decodedToken.split(':');
    if (!uid || !timestamp) {
      console.log('❌ Invalid token structure');
      return res.status(400).json({ error: 'Invalid token structure' });
    }

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      console.log('❌ Token expired:', { tokenAge, maxAge });
      return res.status(401).json({ error: 'Authentication token has expired' });
    }

    console.log('✅ Token validation successful:', {
      uid: uid,
      age: Math.round(tokenAge / 1000 / 60), // age in minutes
      email: email,
      provider: provider
    });

    // Get ERPNext configuration
    const erpnextUrl = process.env.ERPNEXT_URL || 'https://erp.elbrit.in';
    const apiKey = process.env.ERPNEXT_API_KEY;
    const apiSecret = process.env.ERPNEXT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('❌ ERPNext API credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify user exists in ERPNext
    let userEmail = email;
    if (!userEmail && phone) {
      // If no email provided, try to get email from phone number
      try {
        const phoneResponse = await fetch(`${erpnextUrl}/api/resource/Employee?filters=[["cell_number","=","${phone}"]]`, {
          headers: {
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'Content-Type': 'application/json'
          }
        });

        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          if (phoneData.data && phoneData.data.length > 0) {
            userEmail = phoneData.data[0].company_email;
            console.log('📱 Found email from phone number:', userEmail);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch email from phone:', error.message);
      }
    }

    if (!userEmail) {
      console.log('❌ No email found for authentication');
      return res.status(400).json({ error: 'User email is required' });
    }

    // Verify user exists in ERPNext Employee table
    try {
      const userResponse = await fetch(`${erpnextUrl}/api/resource/Employee?filters=[["company_email","=","${userEmail}"]]`, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        console.log('❌ ERPNext API error:', userResponse.status);
        return res.status(500).json({ error: 'Failed to verify user' });
      }

      const userData = await userResponse.json();
      if (!userData.data || userData.data.length === 0) {
        console.log('❌ User not found in ERPNext:', userEmail);
        return res.status(403).json({ error: 'User not authorized' });
      }

      const employee = userData.data[0];
      console.log('✅ User verified in ERPNext:', {
        name: employee.first_name,
        email: employee.company_email,
        employeeId: employee.name
      });

      // Get Raven URL from environment or use default
      const ravenUrl = process.env.RAVEN_URL || 'https://erp.elbrit.org';
      
      // Create Frappe session for Raven
      // This will be handled by Raven's backend when the user accesses the app
      const ravenAuthUrl = ravenUrl;
      
      console.log('🔗 Redirecting to Raven:', ravenAuthUrl);
      
      // Set session cookie for Raven (if same domain)
      // Note: This assumes Raven and your app are on the same domain
      // If different domains, Raven will need to handle token-based auth
      res.setHeader('Set-Cookie', [
        `raven_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax`,
        `raven_user_email=${userEmail}; Path=/; SameSite=Lax`,
        `raven_auth_provider=${provider || 'unknown'}; Path=/; SameSite=Lax`
      ]);

      // Redirect to Raven with authentication
      res.redirect(302, ravenAuthUrl);

    } catch (error) {
      console.error('❌ ERPNext verification error:', error);
      return res.status(500).json({ error: 'Failed to verify user credentials' });
    }

  } catch (error) {
    console.error('❌ Raven Auth Error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }
}
