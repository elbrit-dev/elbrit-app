import React from 'react';
import PlasmicSkeleton from '../components/PlasmicSkeleton';

export default function TestSkeleton() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>PlasmicSkeleton Component Test</h1>
      
      <h2>Basic Skeleton</h2>
      <PlasmicSkeleton count={3} />
      
      <h2>Card Pattern</h2>
      <PlasmicSkeleton pattern="card" />
      
      <h2>Table Pattern</h2>
      <PlasmicSkeleton pattern="table" />
      
      <h2>Custom Styling</h2>
      <PlasmicSkeleton 
        count={2}
        width="200px"
        height="20px"
        baseColor="#e0e0e0"
        highlightColor="#f0f0f0"
      />
    </div>
  );
}
