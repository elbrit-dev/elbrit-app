import React from 'react';
import Head from 'next/head';
import RavenEmbed from '../components/RavenEmbed';

export default function TestRavenSSO() {
  return (
    <div>
      <Head>
        <title>Raven SSO Login Test</title>
        <meta name="description" content="Test page for Raven Embed with SSO login" />
      </Head>

      <div style={{ padding: '20px' }}>
        <h1>Raven Chat with SSO Login</h1>
        <p>This page demonstrates the RavenEmbed component with SSO login functionality.</p>
        <p>If you're not logged in, you'll see SSO login options. If you're already logged in, you'll see the Raven chat directly.</p>
        
        <div style={{ marginTop: '20px' }}>
          <RavenEmbed 
            ravenUrl="https://erp.elbrit.org/raven"
            height="80vh"
            width="100%"
            showSSOOptions={true}
            enableMicrosoftSSO={true}
            enableTruecallerSSO={true}
            apiUrl="https://erp.elbrit.org"
            onLoad={() => console.log('Raven loaded successfully')}
            onError={() => console.log('Raven failed to load')}
          />
        </div>
      </div>
    </div>
  );
}
