import { ensurePlasmicAppUser } from '@plasmicapp/auth-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const appSecret = process.env.PLASMIC_AUTH_SECRET;
    const result = await ensurePlasmicAppUser({
      email,
      appSecret
      // Do NOT send role, roleName, or customProperties for role
    });
    console.log('Plasmic API result:', result);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const { user: plasmicUser, token: plasmicUserToken } = result;

    return res.status(200).json({
      success: true,
      user: plasmicUser,
      token: plasmicUserToken
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 