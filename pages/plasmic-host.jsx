import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
import { PLASMIC } from '../plasmic-init';

export default function PlasmicHost() {
  // Add debug logging for component registration
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Plasmic Host loaded');
      console.log('PLASMIC loader:', PLASMIC);
      
      // Check if components are registered
      const registry = window.__PlasmicComponentRegistry || {};
      console.log('Component registry:', registry);
      console.log('Registered components:', Object.keys(registry));
    }
  }, []);

  if (!PLASMIC) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Plasmic Host Error</h1>
        <p>PLASMIC loader is not available. Check your configuration.</p>
      </div>
    );
  }

  return <PlasmicCanvasHost />;
}
