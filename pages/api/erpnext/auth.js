export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phoneNumber, authProvider } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  try {
    // ERPNext API configuration
    const erpnextUrl = process.env.ERPNEXT_URL;
    const erpnextApiKey = process.env.ERPNEXT_API_KEY;
    const erpnextApiSecret = process.env.ERPNEXT_API_SECRET;

    if (!erpnextUrl || !erpnextApiKey || !erpnextApiSecret) {
      console.error('❌ ERPNext environment variables not configured');
      return res.status(500).json({ error: 'ERPNext configuration missing' });
    }

    console.log('🔐 ERPNext Auth Request:', { email, phoneNumber, authProvider });
    console.log('🔧 ERPNext Config:', { 
      url: erpnextUrl, 
      hasApiKey: !!erpnextApiKey, 
      hasApiSecret: !!erpnextApiSecret 
    });

    // Always search by company_email for role-based access
    // For Microsoft SSO: use email directly as company_email
    // For Phone Auth: get company_email from Employee data first, then search
    let companyEmail = email; // Default for Microsoft SSO
    let searchValue = email;

    // If phone authentication, we need to get the company_email from Employee data first
    if (phoneNumber && !email) {
      console.log('📱 Phone authentication - searching for company_email by phone number');
      
      // Clean phone number (remove +91 country code)
      const cleanedPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '');
      console.log('📱 Original phone number:', phoneNumber);
      console.log('📱 Cleaned phone number:', cleanedPhoneNumber);
      
      // Search Employee table by phone number to get company_email
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([
          ['cell_number', '=', cleanedPhoneNumber]
        ]),
        fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id'])
      });

      console.log('🔍 Searching Employee table for phone number:', phoneNumber);
      
      const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log('📊 Employee search result:', employeeResult);
        console.log('📊 Employee data count:', employeeResult.data?.length || 0);

        if (employeeResult.data && employeeResult.data.length > 0) {
          const employee = employeeResult.data[0];
          companyEmail = employee.company_email;
          searchValue = companyEmail;
          console.log('✅ Found company email for phone user:', companyEmail);
          console.log('✅ Employee details:', employee);
        } else {
          console.warn('⚠️ No employee found for phone number:', phoneNumber);
          // Don't create fallback - reject access if not found
          return res.status(403).json({
            success: false,
            error: 'Access Denied',
            message: 'Phone number not found in organization. Please contact your administrator.',
            details: {
              searchedPhone: phoneNumber,
              authProvider: authProvider,
              userSource: 'phone_not_found'
            }
          });
        }
      } else {
        console.warn('⚠️ Employee search failed:', employeeResponse.status);
        // Don't create fallback - reject access if search fails
        return res.status(403).json({
          success: false,
          error: 'Access Denied',
          message: 'Unable to verify phone number. Please contact your administrator.',
          details: {
            searchedPhone: phoneNumber,
            authProvider: authProvider,
            userSource: 'phone_search_failed'
          }
        });
      }
    }

    // Now search for user data by company_email (unified search for both providers)
    console.log('🔍 Searching for user by company_email:', searchValue);
    
    let userData = null;
    let userSource = '';

    // Search in Employee table by company_email (for both Microsoft SSO and Phone auth)
    const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
    const employeeSearchParams = new URLSearchParams({
      filters: JSON.stringify([['company_email', '=', searchValue]]),
      fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id'])
    });

    console.log('🔍 Searching Employee table by company_email:', employeeSearchUrl);
    console.log('🔍 Search params:', employeeSearchParams.toString());

    console.log('🔍 Making ERPNext API call to:', `${employeeSearchUrl}?${employeeSearchParams}`);
    console.log('🔍 Authorization header:', `token ${erpnextApiKey}:${erpnextApiSecret}`);
    
    const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 ERPNext API Response Status:', employeeResponse.status);
    console.log('📡 ERPNext API Response Headers:', Object.fromEntries(employeeResponse.headers.entries()));

    if (employeeResponse.ok) {
      const employeeResult = await employeeResponse.json();
      console.log('📊 ERPNext Employee search result:', employeeResult);

      if (employeeResult.data && employeeResult.data.length > 0) {
        const employee = employeeResult.data[0];
        userData = {
          uid: employee.name, // Use ERPNext document name as UID
          email: employee.company_email,
          phoneNumber: employee.cell_number || employee.fsl_whatsapp_number,
          displayName: employee.first_name || employee.company_email?.split('@')[0] || 'User',
          role: 'admin', // Default role for now
          roleName: 'Admin',
          kly_role_id: employee.kly_role_id || null, // Add role ID field
          authProvider: authProvider || 'employee', // Use 'employee' for both providers
          customProperties: {
            organization: "Elbrit Life Sciences",
            accessLevel: "full",
            provider: authProvider || 'employee',
            employeeId: employee.name,
            department: employee.department__name,
            designation: employee.designation__name,
            dateOfJoining: employee.date_of_joining,
            dateOfBirth: employee.date_of_birth
          },
          employeeData: employee
        };
        userSource = 'employee';
        console.log('✅ Found user in Employee table by company_email:', userData);
      }
    } else {
      const errorText = await employeeResponse.text();
      console.warn('⚠️ Employee search failed:', employeeResponse.status);
      console.warn('⚠️ Error response:', errorText);
    }

    // No fallback to User table - only Employee table users are allowed
    if (!userData) {
      console.log('❌ User not found in Employee table by company_email:', searchValue);
      console.log('❌ Access denied - user not in organization (Employee table only)');
    }

    // If user not found in ERPNext, reject access
    if (!userData) {
      console.log('❌ User not found in ERPNext by company_email:', searchValue);
      console.log('❌ Access denied - user not in organization');
      
      return res.status(403).json({
        success: false,
        error: 'Access Denied',
        message: 'User not found in organization. Please contact your administrator.',
        details: {
          searchedEmail: searchValue,
          authProvider: authProvider,
          userSource: 'not_found'
        }
      });
    }

    // Generate a simple token (you can implement JWT if needed)
    const token = Buffer.from(`${userData.uid}:${Date.now()}`).toString('base64');

    console.log('✅ ERPNext Auth successful:', {
      userSource,
      companyEmail: searchValue,
      email: userData.email,
      role: userData.role,
      authProvider: userData.authProvider
    });

    return res.status(200).json({
      success: true,
      user: userData,
      token: token,
      userSource: userSource
    });

  } catch (error) {
    console.error('❌ ERPNext Auth Error:', error);
    return res.status(500).json({ 
      error: 'ERPNext authentication failed', 
      details: error.message 
    });
  }
} 