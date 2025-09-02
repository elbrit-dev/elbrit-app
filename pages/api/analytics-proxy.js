// Analytics proxy to handle CORS issues with Plasmic analytics
// This route can be used as a fallback if direct analytics blocking doesn't work

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Log the analytics data (optional - for debugging)
    console.log('Analytics data received:', req.body);

    // For now, just return success without forwarding to Plasmic
    // This prevents the CORS error while still allowing the request to complete
    return res.status(200).json({ 
      success: true, 
      message: 'Analytics data received (not forwarded to prevent CORS issues)' 
    });

    // If you want to forward to Plasmic in the future, uncomment this:
    /*
    const response = await fetch('https://analytics.plasmic.app/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
    */
  } catch (error) {
    console.error('Analytics proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
