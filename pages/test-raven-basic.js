import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import RavenBasic to avoid SSR issues
const RavenBasic = dynamic(() => import('../components/RavenBasic'), { 
  ssr: false, 
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <p>Loading Raven Basic Component...</p>
    </div>
  )
});

export default function TestRavenBasic() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🪶 Raven Chat Basic Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Step 1: Basic iframe Embedding</h2>
        <p>This is the simplest test - just embedding Raven without any authentication.</p>
        <p><strong>Raven URL:</strong> https://elbrit-ls.m.erpnext.com/raven</p>
        <p><strong>Goal:</strong> See if Raven appears on the page (users will login manually)</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Chat Basic Embed</h2>
        <p>Below is the basic Raven chat iframe - no authentication, just pure embedding:</p>
        
        <RavenBasic 
          height="700px"
          width="100%"
          showLoading={true}
          onLoad={() => console.log('✅ Raven Basic loaded successfully!')}
          onError={() => console.log('❌ Raven Basic failed to load')}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>If Raven loads:</strong> Great! iframe embedding works with the new server</li>
          <li>⚠️ <strong>If you see login page:</strong> Perfect! Raven is loading, just needs authentication</li>
          <li>❌ <strong>If you see error:</strong> Check browser console for X-Frame-Options or other issues</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Next Steps</h2>
        <ol>
          <li><strong>If this works:</strong> Raven appears on the page ✅</li>
          <li><strong>Add authentication:</strong> Implement auto-login in the next step</li>
          <li><strong>Use in Plasmic:</strong> Add "Raven Chat Basic" component to your pages</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>Browser Console Check</h2>
        <p>Open browser console (F12) and look for:</p>
        <ul>
          <li>✅ <strong>No errors:</strong> Raven loads successfully</li>
          <li>⚠️ <strong>X-Frame-Options error:</strong> Server still blocking iframe</li>
          <li>⚠️ <strong>CORS errors:</strong> Cross-origin issues</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>This is the simplest test - let's see if Raven appears! 🪶</strong></p>
      </div>
    </div>
  );
}
