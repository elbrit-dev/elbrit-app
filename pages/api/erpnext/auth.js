// Removed Novu SDK - using REST API instead

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phoneNumber, authProvider, oneSignalPlayerId, oneSignalSubscriptionId } = req.body;

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

    // If phone authentication, we need to get the employee data by phone number first
    let employeeIdFromPhone = null;
    if (phoneNumber && !email) {
      console.log('📱 Phone authentication - searching for employee by phone number');
      
      // Clean phone number (remove +91 country code)
      const cleanedPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '');
      console.log('📱 Original phone number:', phoneNumber);
      console.log('📱 Cleaned phone number:', cleanedPhoneNumber);
      
      // Search Employee table by phone number to get employee ID
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([
          ['cell_number', '=', cleanedPhoneNumber]
        ]),
        fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status'])
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
          
          // Check if employee status is Active
          if (employee.status !== 'Active') {
            console.warn('⚠️ Employee account is not active:', phoneNumber, 'Status:', employee.status);
            return res.status(403).json({
              success: false,
              error: 'Access Denied',
              message: 'Your account is not active. Please contact your administrator.',
              details: {
                searchedPhone: phoneNumber,
                authProvider: authProvider,
                userSource: 'phone_inactive',
                status: employee.status
              }
            });
          }
          
          // Store employee ID for direct fetch
          employeeIdFromPhone = employee.name;
          console.log('✅ Found employee ID for phone user:', employeeIdFromPhone);
          console.log('✅ Employee details:', employee);
          
          // If company_email exists, use it as searchValue for Microsoft SSO compatibility
          // If not, we'll fetch directly by employee ID later
          if (employee.company_email) {
            companyEmail = employee.company_email;
            searchValue = companyEmail;
            console.log('✅ Company email available:', companyEmail);
          } else {
            console.log('⚠️ No company email - will fetch by employee ID:', employeeIdFromPhone);
          }
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

    // Now fetch user data - either by employee ID (phone auth) or by company_email (Microsoft SSO)
    let userData = null;
    let userSource = '';

    // If we have employee ID from phone auth, fetch directly by ID
    if (employeeIdFromPhone) {
      console.log('🔍 Fetching employee data by ID:', employeeIdFromPhone);
      
      const employeeUrl = `${erpnextUrl}/api/resource/Employee/${employeeIdFromPhone}`;
      
      console.log('🔍 Making ERPNext API call to:', employeeUrl);
      
      const employeeResponse = await fetch(employeeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 ERPNext API Response Status:', employeeResponse.status);

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log('📊 ERPNext Employee fetch result:', employeeResult);

        if (employeeResult.data) {
          const employee = employeeResult.data;
          
          // Double-check employee status is Active
          if (employee.status !== 'Active') {
            console.warn('⚠️ Employee account is not active:', employeeIdFromPhone, 'Status:', employee.status);
            return res.status(403).json({
              success: false,
              error: 'Access Denied',
              message: 'Your account is not active. Please contact your administrator.',
              details: {
                employeeId: employeeIdFromPhone,
                authProvider: authProvider,
                userSource: 'employee_inactive',
                status: employee.status
              }
            });
          }
          
          userData = {
            uid: employee.name, // Use ERPNext document name as UID
            email: employee.company_email || `${employee.name}@elbrit.org`, // Fallback email if null
            phoneNumber: employee.cell_number || employee.fsl_whatsapp_number,
            displayName: employee.first_name || employee.employee_name || 'User',
            role: 'admin', // Default role for now
            roleName: 'Admin',
            kly_role_id: employee.kly_role_id || null, // Add role ID field
            authProvider: authProvider || 'phone', // Use 'phone' for phone auth
            customProperties: {
              organization: "Elbrit Life Sciences",
              accessLevel: "full",
              provider: authProvider || 'phone',
              employeeId: employee.name,
              department: employee.department,
              designation: employee.designation,
              dateOfJoining: employee.date_of_joining,
              dateOfBirth: employee.date_of_birth
            },
            employeeData: employee
          };
          userSource = 'employee_by_id';
          console.log('✅ Found user in Employee table by ID:', userData);
        }
      } else {
        const errorText = await employeeResponse.text();
        console.warn('⚠️ Employee fetch by ID failed:', employeeResponse.status);
        console.warn('⚠️ Error response:', errorText);
      }
    } 
    // Otherwise, search by company_email (for Microsoft SSO)
    else if (searchValue) {
      console.log('🔍 Searching for user by company_email:', searchValue);
      
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([['company_email', '=', searchValue]]),
        fields: JSON.stringify(['name', 'first_name', 'employee_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status', 'department', 'designation', 'date_of_joining', 'date_of_birth'])
      });

      console.log('🔍 Searching Employee table by company_email:', employeeSearchUrl);
      console.log('🔍 Search params:', employeeSearchParams.toString());
      
      const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 ERPNext API Response Status:', employeeResponse.status);

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log('📊 ERPNext Employee search result:', employeeResult);

        if (employeeResult.data && employeeResult.data.length > 0) {
          const employee = employeeResult.data[0];
          
          // Check if employee status is Active
          if (employee.status !== 'Active') {
            console.warn('⚠️ Employee account is not active:', searchValue, 'Status:', employee.status);
            return res.status(403).json({
              success: false,
              error: 'Access Denied',
              message: 'Your account is not active. Please contact your administrator.',
              details: {
                searchedEmail: searchValue,
                authProvider: authProvider,
                userSource: 'employee_inactive',
                status: employee.status
              }
            });
          }
          
          userData = {
            uid: employee.name, // Use ERPNext document name as UID
            email: employee.company_email,
            phoneNumber: employee.cell_number || employee.fsl_whatsapp_number,
            displayName: employee.first_name || employee.employee_name || employee.company_email?.split('@')[0] || 'User',
            role: 'admin', // Default role for now
            roleName: 'Admin',
            kly_role_id: employee.kly_role_id || null, // Add role ID field
            authProvider: authProvider || 'microsoft', // Use 'microsoft' for email auth
            customProperties: {
              organization: "Elbrit Life Sciences",
              accessLevel: "full",
              provider: authProvider || 'microsoft',
              employeeId: employee.name,
              department: employee.department,
              designation: employee.designation,
              dateOfJoining: employee.date_of_joining,
              dateOfBirth: employee.date_of_birth
            },
            employeeData: employee
          };
          userSource = 'employee_by_email';
          console.log('✅ Found user in Employee table by company_email:', userData);
        }
      } else {
        const errorText = await employeeResponse.text();
        console.warn('⚠️ Employee search by email failed:', employeeResponse.status);
        console.warn('⚠️ Error response:', errorText);
      }
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

    // Fetch subscriber data from OneSignal and create/update Novu subscriber
    if (oneSignalPlayerId && oneSignalSubscriptionId) {
      try {
        const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
        const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
        const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;
        
        if (!novuSecretKey) {
          console.warn('⚠️ Novu secret key not found. Skipping Novu update.');
        } else {
          // Fetch subscriber data from OneSignal API
          let oneSignalSubscriberData = null;
          if (oneSignalAppId && oneSignalRestApiKey) {
            try {
              console.log('📡 Fetching subscriber data from OneSignal...');
              // OneSignal REST API uses Basic auth with base64 encoded REST API key
              // Format: Basic base64(:rest_api_key) or just Basic rest_api_key (some APIs accept this)
              const basicAuth = Buffer.from(`:${oneSignalRestApiKey}`).toString('base64');
              
              const oneSignalResponse = await fetch(`https://onesignal.com/api/v1/players/${oneSignalPlayerId}?app_id=${oneSignalAppId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Basic ${basicAuth}`,
                  'Content-Type': 'application/json'
                }
              });

              if (oneSignalResponse.ok) {
                oneSignalSubscriberData = await oneSignalResponse.json();
                console.log('✅ OneSignal subscriber data fetched:', {
                  playerId: oneSignalPlayerId,
                  email: oneSignalSubscriberData.email,
                  identifier: oneSignalSubscriberData.identifier,
                  externalUserId: oneSignalSubscriberData.external_user_id
                });
              } else {
                const errorText = await oneSignalResponse.text();
                console.warn('⚠️ Failed to fetch OneSignal subscriber data:', oneSignalResponse.status, errorText);
              }
            } catch (oneSignalError) {
              console.warn('⚠️ Error fetching OneSignal subscriber data:', oneSignalError);
            }
          } else {
            console.warn('⚠️ OneSignal API credentials not configured. Using ERPNext data only.');
          }

          // Prepare subscriber data - use OneSignal data if available, otherwise use ERPNext data
          const subscriberId = oneSignalSubscriptionId || userData.email || userData.uid;
          const firstName = userData.displayName?.split(' ')[0] || userData.first_name || oneSignalSubscriberData?.name?.split(' ')[0] || 'User';
          const lastName = userData.displayName?.split(' ').slice(1).join(' ') || userData.last_name || oneSignalSubscriberData?.name?.split(' ').slice(1).join(' ') || '';
          const subscriberEmail = userData.email || oneSignalSubscriberData?.email || null;
          const subscriberPhone = userData.phoneNumber || oneSignalSubscriberData?.phone || null;
          const avatar = oneSignalSubscriberData?.avatar || null;
          
          // Generate idempotency key for create/update operations
          const idempotencyKey = `${subscriberId}-${Date.now()}`;

          // Try to create subscriber first (with failIfExists=true to check if exists)
          try {
            console.log('📤 Creating/updating Novu subscriber...');
            const createResponse = await fetch('https://api.novu.co/v2/subscribers?failIfExists=true', {
              method: 'POST',
              headers: {
                'idempotency-key': idempotencyKey,
                'Authorization': `ApiKey ${novuSecretKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: subscriberEmail,
                phone: subscriberPhone,
                avatar: avatar,
                locale: 'en-US',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
                data: {
                  employeeId: userData.uid,
                  role: userData.role,
                  authProvider: userData.authProvider,
                  ...userData.customProperties
                },
                subscriberId: subscriberId
              })
            });

            if (createResponse.ok) {
              console.log('✅ Novu subscriber created/updated successfully:', {
                subscriberId,
                email: subscriberEmail,
                playerId: oneSignalPlayerId
              });
            } else if (createResponse.status === 409) {
              // Subscriber already exists, update it
              console.log('📝 Subscriber exists, updating...');
              const updateResponse = await fetch(`https://api.novu.co/v2/subscribers/${subscriberId}`, {
                method: 'PUT',
                headers: {
                  'idempotency-key': idempotencyKey,
                  'Authorization': `ApiKey ${novuSecretKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  firstName: firstName,
                  lastName: lastName,
                  email: subscriberEmail,
                  phone: subscriberPhone,
                  avatar: avatar,
                  locale: 'en-US',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
                  data: {
                    employeeId: userData.uid,
                    role: userData.role,
                    authProvider: userData.authProvider,
                    ...userData.customProperties
                  }
                })
              });

              if (updateResponse.ok) {
                console.log('✅ Novu subscriber updated successfully:', {
                  subscriberId,
                  email: subscriberEmail,
                  playerId: oneSignalPlayerId
                });
              } else {
                const errorText = await updateResponse.text();
                console.error('❌ Failed to update Novu subscriber:', updateResponse.status, errorText);
              }
            } else {
              const errorText = await createResponse.text();
              console.error('❌ Failed to create/update Novu subscriber:', createResponse.status, errorText);
            }
          } catch (novuError) {
            console.error('❌ Error creating/updating Novu subscriber:', novuError);
          }
        }
      } catch (error) {
        console.error('❌ Error in Novu subscriber sync:', error);
        // Don't fail the auth request if Novu update fails
      }
    }

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