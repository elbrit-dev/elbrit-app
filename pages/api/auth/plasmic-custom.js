import { ensurePlasmicAppUser } from '@plasmicapp/auth-api';

// Group ID to Role mapping - configure this based on your Azure AD groups
const IT_GROUP_ID = "036a7a77-668a-4217-a549-8a2192aa0e14";
const HR_GROUP_ID = "50e52dda-3288-445a-a6b5-dac7677412e6";

const GROUP_ROLE_MAPPING = {
  // IT Team group → Admin role
  [IT_GROUP_ID]: 'Admin',
  
  // HR Team group → Editor role  
  [HR_GROUP_ID]: 'Editor',
  
  // Add more group mappings as needed
  // 'your-group-id-here': 'RoleName',
};

// Function to determine the highest role based on group memberships
function getHighestRoleFromGroups(groupIds) {
  if (!groupIds || groupIds.length === 0) {
    return 'Normal User'; // Default role if no groups
  }

  const roles = [];
  
  // Check each group and collect assigned roles
  groupIds.forEach(groupId => {
    const role = GROUP_ROLE_MAPPING[groupId];
    if (role) {
      roles.push(role);
      console.log(`Group ${groupId} → Role: ${role}`);
    } else {
      console.log(`Group ${groupId} → No role mapping found`);
    }
  });

  // If no roles found from groups, return default
  if (roles.length === 0) {
    console.log('No roles found from groups, using default: Normal User');
    return 'Normal User';
  }

  // Role hierarchy (highest to lowest)
  const roleHierarchy = ['Admin', 'Editor', 'Normal User'];
  
  // Find the highest role
  for (const hierarchyRole of roleHierarchy) {
    if (roles.includes(hierarchyRole)) {
      console.log(`Highest role determined: ${hierarchyRole}`);
      return hierarchyRole;
    }
  }

  return 'Normal User';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, groupIds } = req.body;
  console.log('Plasmic Auth API called with:', { email, groupIds });

  if (!email) {
    console.error('No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Determine role based on group membership
    const assignedRole = getHighestRoleFromGroups(groupIds);
    console.log(`User ${email} assigned role: ${assignedRole} based on groups:`, groupIds);

    // Use the Plasmic Auth secret from the Plasmic Studio Auth settings
    const appSecret = 'A2FFbtNUAhJZdJlSEZHy3Xp6YPjILSvONddfqsIKbo32xyJSwNF73CDvRvxANjt8Kl7cngAuGi03lvaFNumg';
    
    
    console.log('Calling ensurePlasmicAppUser with email:', email);
    
    const result = await ensurePlasmicAppUser({
      email: email,
      appSecret: appSecret,
      // Pass role and group information as custom properties
      customProperties: {
        groups: groupIds || [],
        assignedRole: assignedRole,
        groupRoleMapping: groupIds?.map(id => ({
          groupId: id,
          role: GROUP_ROLE_MAPPING[id] || 'Unknown'
        })) || []
      },
      // Try setting role in different ways to ensure it's applied
      role: assignedRole,
      roleName: assignedRole,
      // Add user properties that might help with role assignment
      properties: {
        role: assignedRole,
        source: 'azure-ad-groups'
      }
    });

    console.log('ensurePlasmicAppUser result:', result);
    console.log('Expected role:', assignedRole);
    console.log('Actual role in result:', result.user?.roleName);

    if (result.error) {
      console.error('Plasmic Auth error:', result.error);
      return res.status(400).json({ error: result.error });
    }

    const { user: plasmicUser, token: plasmicUserToken } = result;
    
    // If the role wasn't set correctly, log the issue
    if (plasmicUser?.roleName !== assignedRole) {
      console.warn(`⚠️  Role mismatch! Expected: ${assignedRole}, Got: ${plasmicUser?.roleName}`);
      console.warn('This might be due to Plasmic user directory settings overriding the role');
      console.warn('Available roles in Plasmic:', plasmicUser?.roleNames);
    }
    
    console.log('Plasmic Auth successful for user:', plasmicUser?.email);
    console.log('User role in Plasmic:', plasmicUser?.roleName);
    console.log('All available roles:', plasmicUser?.roleNames);
    
    return res.status(200).json({
      success: true,
      user: plasmicUser,
      token: plasmicUserToken,
      assignedRole: assignedRole,
      groupRoleMapping: groupIds?.map(id => ({
        groupId: id,
        role: GROUP_ROLE_MAPPING[id] || 'Unknown'
      })) || []
    });

  } catch (error) {
    console.error('Failed to authenticate with Plasmic:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 