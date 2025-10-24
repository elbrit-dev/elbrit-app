import React from 'react';
import { useAuth } from '../components/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import RavenModal to avoid SSR issues
const RavenModal = dynamic(() => import('../components/RavenModal'), { 
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
      <p>Loading Raven Modal Component...</p>
    </div>
  )
});

export default function TestRavenModal() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading Authentication...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>❌ Not Authenticated</h1>
        <p>Please log in first to test Raven modal integration.</p>
        <p>Go to <a href="/test-auth">/test-auth</a> to log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🪶 Raven Chat Modal Integration Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>User:</strong> {user?.email || user?.phoneNumber}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Display Name:</strong> {user?.displayName}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2>LocalStorage Data</h2>
        <p><strong>ERPNext Token:</strong> {typeof window !== 'undefined' ? localStorage.getItem('erpnextAuthToken') ? '✅ Available' : '❌ Missing' : 'N/A'}</p>
        <p><strong>User Email:</strong> {typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'Not stored' : 'N/A'}</p>
        <p><strong>Auth Provider:</strong> {typeof window !== 'undefined' ? localStorage.getItem('authProvider') || 'Not stored' : 'N/A'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🪶 Raven Chat Modal</h2>
        <p>Click the button below to open Raven in a modal popup <strong>inside your app</strong>:</p>
        <p><strong>Raven URL:</strong> https://erp.elbrit.org</p>
        <p><strong>Approach:</strong> Modal popup with iframe inside your app</p>
        
        <div style={{ marginTop: '20px' }}>
          <RavenModal 
            buttonText="🪶 Open Raven Chat in Modal"
            modalTitle="Raven Chat - Team Communication"
            buttonStyle={{
              backgroundColor: '#28a745',
              fontSize: '18px',
              padding: '15px 30px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
            onOpen={() => console.log('✅ Raven modal opened!')}
            onClose={() => console.log('❌ Raven modal closed!')}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h2>How This Modal Works</h2>
        <ol>
          <li><strong>Button Click:</strong> User clicks the "Open Raven Chat in Modal" button</li>
          <li><strong>Modal Opens:</strong> A full-screen modal popup appears inside your app</li>
          <li><strong>Raven Loads:</strong> Raven loads inside the modal with auto-login</li>
          <li><strong>Full Functionality:</strong> Users get complete Raven chat experience</li>
          <li><strong>Easy Close:</strong> Click X button or press Escape to close</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h2>Modal Features</h2>
        <ul>
          <li>✅ <strong>Inside Your App:</strong> Opens within your app, not separate window</li>
          <li>✅ <strong>Full Screen:</strong> Takes up most of the screen for optimal chat experience</li>
          <li>✅ <strong>Auto-Login:</strong> Users are automatically logged into Raven</li>
          <li>✅ <strong>Easy Close:</strong> Click X or press Escape key</li>
          <li>✅ <strong>Responsive:</strong> Works on desktop and mobile</li>
          <li>✅ <strong>No iframe Restrictions:</strong> Bypasses X-Frame-Options issues</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
        <h2>Expected Results</h2>
        <ul>
          <li>✅ <strong>If you see Raven chat interface:</strong> Modal integration works perfectly!</li>
          <li>⚠️ <strong>If you see Raven login page:</strong> Auto-login didn't work, but you can login manually</li>
          <li>❌ <strong>If you see error message:</strong> Check browser console for details</li>
          <li>🔄 <strong>Modal behavior:</strong> Should open/close smoothly</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>This is the perfect solution for embedding Raven inside your app!</strong></p>
        <p>Use "Raven Chat Modal" component in Plasmic Studio for the best user experience.</p>
      </div>
    </div>
  );
}
