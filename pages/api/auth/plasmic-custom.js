import { ensurePlasmicAppUser } from '@plasmicapp/auth-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  try {
    const appSecret = process.env.PLASMIC_AUTH_SECRET;
    const publicToken = process.env.PLASMIC_CMS_PUBLIC_TOKEN;
    const secretToken = process.env.PLASMIC_CMS_SECRET_TOKEN;
    const cmsDbId = process.env.PLASMIC_CMS_DATABASE_ID;

    // Use email or phone number for authentication
    const identifier = email || phoneNumber;

    // Ensure user exists in Plasmic
    const result = await ensurePlasmicAppUser({
      email: identifier, // Plasmic might need email format, but we can pass phone as email
      appSecret
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const { user: plasmicUser, token: plasmicUserToken } = result;

    // Add phone number to user data if provided
    let userWithPhone = plasmicUser;
    if (phoneNumber) {
      userWithPhone = {
        ...plasmicUser,
        phoneNumber: phoneNumber,
        customProperties: {
          ...plasmicUser.customProperties,
          phoneNumber: phoneNumber
        }
      };
    }

    // Fetch user role from CMS if we have the public token
    let userWithRole = userWithPhone;
    if (publicToken && cmsDbId) {
      try {
        // Look for user in the users table or any relevant table that contains roles
        // This assumes you have a users table with email and roleId fields
        const usersTableResponse = await fetch(`https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables`, {
          headers: {
            'x-plasmic-api-cms-tokens': `${cmsDbId}:${publicToken}`
          }
        });

        if (usersTableResponse.ok) {
          const tables = await usersTableResponse.json();
          console.log('📋 Available CMS tables:', tables.map(t => t.name));

          // Look for a users table or similar
          const usersTable = tables.find(table => 
            table.name.toLowerCase().includes('user') || 
            table.name.toLowerCase().includes('member') ||
            table.name.toLowerCase().includes('profile')
          );

          if (usersTable) {
            console.log('👤 Found users table:', usersTable.name, 'ID:', usersTable.id);
            
            // Create query URL with parameters (GET method for reading)
            const queryParams = new URLSearchParams({
              q: JSON.stringify({
                where: {
                  email: email || phoneNumber // Search by email or phone number
                },
                limit: 1
              })
            });
            
            // Query for the user by email using GET method
            const userQueryResponse = await fetch(`https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${usersTable.id}/query?${queryParams}`, {
              method: 'GET',
              headers: {
                'x-plasmic-api-cms-tokens': `${cmsDbId}:${publicToken}`
              }
            });

            if (userQueryResponse.ok) {
              const userQueryResult = await userQueryResponse.json();
              const cmsUser = userQueryResult?.rows?.[0];
              
              // Try to get user data from published data first, then fall back to draft data
              const userData = cmsUser?.data || cmsUser?.draftData;
              
              if (cmsUser && userData?.roleId) {
                console.log('🔑 Found user role in CMS:', userData.roleId);
                userWithRole = {
                  ...userWithPhone,
                  role: userData.roleId,
                  roleId: userData.roleId,
                  roleName: userData.roleName || 'User',
                  customProperties: {
                    ...userWithPhone.customProperties,
                    cmsRole: userData.roleId,
                    cmsRoleName: userData.roleName
                  }
                };
              }
            }
          }
        }
      } catch (cmsError) {
        console.error('❌ Error fetching user role from CMS:', cmsError);
        // Continue with basic user data if CMS query fails
      }
    }

    // Return the user object with role information
    return res.status(200).json({
      success: true,
      user: userWithRole,
      token: plasmicUserToken
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Helper function for CMS write operations (create/update user)
export async function createOrUpdateCMSUser(email, userData, cmsDbId, secretToken, usersTableId) {
  try {
    // First, check if user exists
    const queryParams = new URLSearchParams({
      q: JSON.stringify({
        where: { email: email },
        limit: 1
      })
    });

    const existingUserResponse = await fetch(`https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${usersTableId}/query?${queryParams}`, {
      method: 'GET',
      headers: {
        'x-plasmic-api-cms-tokens': `${cmsDbId}:${secretToken}` // Use secret token for read in preparation for write
      }
    });

    if (existingUserResponse.ok) {
      const existingUserResult = await existingUserResponse.json();
      const existingUser = existingUserResult?.rows?.[0];

      if (existingUser) {
        // Update existing user using correct CMS API format
        const updateResponse = await fetch(`https://data.plasmic.app/api/v1/cms/rows/${existingUser.id}?publish=1`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-plasmic-api-cms-tokens': `${cmsDbId}:${secretToken}`
          },
          body: JSON.stringify({
            data: {
              ...userData,
              email // Ensure email is included
            }
          })
        });

        if (updateResponse.ok) {
          return await updateResponse.json();
        } else {
          throw new Error('Failed to update user in CMS');
        }
      } else {
        // Create new user using correct CMS API format
        const createResponse = await fetch(`https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${usersTableId}/rows?publish=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-plasmic-api-cms-tokens': `${cmsDbId}:${secretToken}`
          },
          body: JSON.stringify({
            rows: [
              {
                data: {
                  ...userData,
                  email // Ensure email is included
                }
              }
            ]
          })
        });

        if (createResponse.ok) {
          return await createResponse.json();
        } else {
          throw new Error('Failed to create user in CMS');
        }
      }
    } else {
      throw new Error('Failed to check existing user in CMS');
    }
  } catch (error) {
    console.error('❌ Error in createOrUpdateCMSUser:', error);
    throw error;
  }
} 