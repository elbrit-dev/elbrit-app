import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, phoneNumber, token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    console.log('🔄 ERPNext session request:', { email, phoneNumber, hasToken: !!token });

    // Get user data from Firestore
    const db = getFirestore(app);
    const userDocRef = doc(db, 'users', email || phoneNumber);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('❌ User not found in Firestore');
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    console.log('👤 Found user data:', { 
      email: userData.email, 
      displayName: userData.displayName,
      role: userData.role 
    });

    // Create session cookies that match ERPNext format
    const cookies = {
      'full_name': userData.displayName || userData.fullName || 'User',
      'user_id': userData.email || userData.phoneNumber || 'user',
      'system_user': 'yes',
      'sid': token.substring(0, 20), // Use first 20 chars of token as session ID
      'user_image': userData.photoURL || ''
    };

    // Add role-specific cookies if available
    if (userData.role) {
      cookies['role'] = userData.role;
    }

    console.log('🍪 Generated cookies:', cookies);

    return res.status(200).json({
      success: true,
      cookies: cookies,
      user: {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ERPNext session error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
