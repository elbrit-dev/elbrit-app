import React from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import RavenLauncher to avoid SSR issues
const RavenLauncher = dynamic(() => import('../components/RavenLauncher'), { 
  ssr: false, 
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <p>Loading Raven Launcher Component...</p>
    </div>
  )
});

export default function TestRavenLauncher() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading Authentication...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🪶 Raven Chat Launcher Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Alternative Solution: Open in New Window</h2>
        <p>Since iframe embedding is blocked, this opens Raven in a new window/tab.</p>
        <p><strong>Raven URL:</strong> https://elbrit-ls.m.erpnext.com/raven</p>
        <p><strong>Authentication:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Chat Launcher</h2>
        <p>Click the button below to open Raven in a new window:</p>
        
        <div style={{ marginTop: '20px' }}>
          <RavenLauncher 
            buttonText="🪶 Open Raven Chat in New Window"
            buttonStyle={{
              backgroundColor: '#28a745',
              fontSize: '18px',
              padding: '15px 30px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
            onOpen={() => console.log('✅ Raven window opened!')}
            onError={() => console.log('❌ Raven failed to open')}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>How This Works</h2>
        <ul>
          <li>✅ <strong>Desktop:</strong> Opens Raven in new window with auto-login</li>
          <li>✅ <strong>Mobile:</strong> Tries to open Raven mobile app</li>
          <li>✅ <strong>No iframe restrictions:</strong> Bypasses X-Frame-Options completely</li>
          <li>✅ <strong>Full functionality:</strong> Complete Raven chat experience</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>Click button:</strong> New window/tab opens with Raven</li>
          <li>✅ <strong>Auto-login:</strong> Should be logged in automatically (if authenticated)</li>
          <li>✅ <strong>Full chat:</strong> Complete Raven functionality available</li>
        </ul>
      </div>

      {!isAuthenticated && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
          <h2>⚠️ Not Authenticated</h2>
          <p>You're not logged in, so auto-login won't work.</p>
          <p>Go to <a href="/test-auth">/test-auth</a> to log in first, then come back here.</p>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>This should work even with iframe restrictions! 🪶</strong></p>
      </div>
    </div>
  );
}
