import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from "@novu/api/models/components";

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
      
      // Generate multiple phone number formats to try
      const phoneVariations = [];
      
      // Original with country code
      phoneVariations.push(phoneNumber);
      
      // Remove +91 country code
      let cleanedPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '');
      phoneVariations.push(cleanedPhoneNumber);
      
      // Remove any remaining + or spaces
      cleanedPhoneNumber = cleanedPhoneNumber.replace(/^\+/, '').replace(/\s/g, '');
      if (!phoneVariations.includes(cleanedPhoneNumber)) {
        phoneVariations.push(cleanedPhoneNumber);
      }
      
      // If the number starts with 91 and is longer than 10 digits, remove the 91
      if (cleanedPhoneNumber.startsWith('91') && cleanedPhoneNumber.length > 10) {
        const without91 = cleanedPhoneNumber.substring(2);
        if (!phoneVariations.includes(without91)) {
          phoneVariations.push(without91);
        }
      }
      
      console.log('📱 Original phone number:', phoneNumber);
      console.log('📱 Phone number variations to try:', phoneVariations);
      
      // Try searching with different phone number formats
      let employeeFound = false;
      let lastError = null;
      let lastErrorText = null;
      
      for (const phoneToSearch of phoneVariations) {
        // Try cell_number first
        const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
        const employeeSearchParams = new URLSearchParams({
          filters: JSON.stringify([
            ['cell_number', '=', phoneToSearch]
          ]),
          fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status'])
        });

        console.log('🔍 Searching Employee table for phone number (cell_number):', phoneToSearch);
        
        try {
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
              
              employeeFound = true;
              break;
            }
          } else {
            // Log the error for debugging
            lastError = employeeResponse.status;
            lastErrorText = await employeeResponse.text().catch(() => 'Could not read error response');
            console.warn('⚠️ Employee search failed for phone format:', phoneToSearch, 'Status:', lastError);
            console.warn('⚠️ Error response:', lastErrorText);
            
            // If it's a 403 or 401, it's likely an auth issue, not a format issue
            if (employeeResponse.status === 403 || employeeResponse.status === 401) {
              console.error('❌ ERPNext API authentication failed. Check API credentials.');
              return res.status(500).json({
                success: false,
                error: 'ERPNext API Error',
                message: 'Unable to connect to ERPNext. Please contact your administrator.',
                details: {
                  searchedPhone: phoneNumber,
                  authProvider: authProvider,
                  userSource: 'erpnext_api_error',
                  erpnextStatus: lastError,
                  erpnextError: lastErrorText
                }
              });
            }
          }
        } catch (fetchError) {
          console.error('❌ Network error during employee search:', fetchError);
          lastError = fetchError.message;
        }
        
        // If not found in cell_number, try fsl_whatsapp_number
        if (!employeeFound) {
          const whatsappSearchParams = new URLSearchParams({
            filters: JSON.stringify([
              ['fsl_whatsapp_number', '=', phoneToSearch]
            ]),
            fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status'])
          });

          console.log('🔍 Searching Employee table for phone number (fsl_whatsapp_number):', phoneToSearch);
          
          try {
            const whatsappResponse = await fetch(`${employeeSearchUrl}?${whatsappSearchParams}`, {
              method: 'GET',
              headers: {
                'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
                'Content-Type': 'application/json'
              }
            });

            if (whatsappResponse.ok) {
              const whatsappResult = await whatsappResponse.json();
              if (whatsappResult.data && whatsappResult.data.length > 0) {
                const employee = whatsappResult.data[0];
                
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
                
                employeeIdFromPhone = employee.name;
                console.log('✅ Found employee ID via WhatsApp number:', employeeIdFromPhone);
                
                if (employee.company_email) {
                  companyEmail = employee.company_email;
                  searchValue = companyEmail;
                }
                
                employeeFound = true;
                break;
              }
            }
          } catch (fetchError) {
            console.error('❌ Network error during WhatsApp number search:', fetchError);
          }
        }
      }
      
      // If no employee found after trying all variations
      if (!employeeFound) {
        console.warn('⚠️ No employee found for any phone number variation:', phoneVariations);
        return res.status(403).json({
          success: false,
          error: 'Access Denied',
          message: 'Phone number not found in organization. Please contact your administrator.',
          details: {
            searchedPhone: phoneNumber,
            triedVariations: phoneVariations,
            authProvider: authProvider,
            userSource: 'phone_not_found',
            lastError: lastError,
            lastErrorText: lastErrorText
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

    // Fetch teams and warehouses using REST API if kly_role_id exists
    let teamsData = null;
    if (userData.kly_role_id) {
      try {
        console.log('🔍 Fetching teams and warehouses for role ID:', userData.kly_role_id);
        
        // Use REST API to fetch Elbrit Role ID - filter by name (role ID)
        // Doctype name is "Elbrit Role ID" (with spaces) - encode spaces as %20 for URL
        const doctypeName = 'Elbrit Role ID';
        const roleSearchUrl = `${erpnextUrl}/api/resource/${encodeURIComponent(doctypeName)}`;
        const roleSearchParams = new URLSearchParams({
          filters: JSON.stringify([['name', '=', userData.kly_role_id]]),
          fields: JSON.stringify([
            'name',
            'employee__name',
            'employee_name',
            'designation__name',
            'hq__name',
            'elbrit_sales_team',
            'sales_team'
          ])
        });

        const roleResponse = await fetch(`${roleSearchUrl}?${roleSearchParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
            'Content-Type': 'application/json'
          }
        });

        if (roleResponse.ok) {
          const roleResult = await roleResponse.json();
          console.log('📊 ElbritRoleIDS REST API response:', roleResult);

          if (roleResult.data && roleResult.data.length > 0) {
            const roleData = roleResult.data[0]; // Should only be one match since we filtered by name
            console.log('📊 Role data:', roleData);

            // Extract teams and CFA (warehouses) from role data
            const n = roleData;
            const teams = [];
            const cfa = []; // warehouses/CFA

            // Extract teams and warehouses from elbrit_sales_team (CFA roles - multiple teams)
            if (n.elbrit_sales_team && Array.isArray(n.elbrit_sales_team)) {
              n.elbrit_sales_team.forEach(item => {
                // Get team name
                const teamName = item?.sales_team?.name || item?.sales_team;
                if (teamName) teams.push(teamName);
                
                // Get warehouse (CFA)
                const warehouse = item?.sales_team?.warehouse__name || item?.sales_team?.warehouse;
                if (warehouse) cfa.push(warehouse);
              });
            }

            // Extract teams and warehouses from sales_team (normal role - single team)
            if (n.sales_team) {
              const teamName = typeof n.sales_team === 'string' 
                ? n.sales_team 
                : (n.sales_team?.name || n.sales_team);
              
              if (teamName) teams.push(teamName);
              
              const warehouse = typeof n.sales_team === 'object'
                ? (n.sales_team?.warehouse__name || n.sales_team?.warehouse)
                : null;
              
              if (warehouse) cfa.push(warehouse);
            }

            // Create teams data - deduplicate arrays
            teamsData = {
              teams: [...new Set(teams)],
              CFA: [...new Set(cfa)]
            };
            
            console.log('✅ Teams and CFA fetched successfully:', teamsData);
          } else {
            console.warn('⚠️ No role data found for role ID:', userData.kly_role_id);
          }
        } else {
          const errorText = await roleResponse.text();
          console.warn('⚠️ REST API query failed:', roleResponse.status, errorText);
          // Don't fail auth if REST API query fails
        }
      } catch (error) {
        console.error('❌ Error fetching teams and warehouses:', error);
        // Don't fail auth if REST API query fails
      }
    } else {
      console.log('ℹ️ No kly_role_id found, skipping teams/warehouses fetch');
    }

    // Generate a simple token (you can implement JWT if needed)
    const token = Buffer.from(`${userData.uid}:${Date.now()}`).toString('base64');

    console.log('✅ ERPNext Auth successful:', {
      userSource,
      companyEmail: searchValue,
      email: userData.email,
      role: userData.role,
      authProvider: userData.authProvider,
      hasTeamsData: !!teamsData
    });

    // Update Novu subscriber credentials with OneSignal player ID and subscription ID if provided
    if (oneSignalPlayerId) {
      try {
        const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
        
        if (novuSecretKey) {
          const novu = new Novu({
            secretKey: novuSecretKey,
            // Use serverURL for EU region if needed
            // serverURL: "https://eu.api.novu.co",
          });

          // Use subscription ID as subscriber ID, fallback to email/uid if not available
          const subscriberId = oneSignalSubscriptionId;
          const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER || null;

          const updateParams = {
            providerId: ChatOrPushProviderEnum.OneSignal,
            credentials: {
              deviceTokens: [oneSignalPlayerId], // Use player ID (onesignalId) for device tokens
            },
          };

          // Add integrationIdentifier if provided
          if (integrationIdentifier) {
            updateParams.integrationIdentifier = integrationIdentifier;
          }

          await novu.subscribers.credentials.update(updateParams, subscriberId);

          console.log('✅ Novu subscriber credentials updated successfully:', {
            subscriberId,
            playerId: oneSignalPlayerId,
            subscriptionId: oneSignalSubscriptionId,
            integrationIdentifier,
          });
        } else {
          console.warn('⚠️ Novu secret key not found. Skipping Novu update.');
        }
      } catch (error) {
        console.error('❌ Error updating Novu subscriber credentials:', error);
        // Don't fail the auth request if Novu update fails
      }
    }

    return res.status(200).json({
      success: true,
      user: userData,
      token: token,
      userSource: userSource,
      teams: teamsData || null
    });

  } catch (error) {
    console.error('❌ ERPNext Auth Error:', error);
    return res.status(500).json({ 
      error: 'ERPNext authentication failed', 
      details: error.message 
    });
  }
} 