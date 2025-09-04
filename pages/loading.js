import React from 'react';
import AntSkeletonWrapper from '../components/AntSkeletonWrapper';

export default function Loading() {
  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header skeleton */}
        <div style={{ marginBottom: '20px' }}>
          <AntSkeletonWrapper 
            active={true}
            avatar={true}
            paragraph={{ rows: 1 }}
            title={{ width: "40%" }}
          />
        </div>
        
        {/* Main content skeleton */}
        <div style={{ marginBottom: '20px' }}>
          <AntSkeletonWrapper 
            active={true}
            paragraph={{ rows: 4 }}
            title={{ width: "60%" }}
          />
        </div>
        
        {/* Table/card skeleton */}
        <div style={{ marginBottom: '20px' }}>
          <AntSkeletonWrapper 
            active={true}
            paragraph={{ rows: 6 }}
            title={{ width: "30%" }}
          />
        </div>
        
        {/* Footer skeleton */}
        <div>
          <AntSkeletonWrapper 
            active={true}
            paragraph={{ rows: 2 }}
            title={{ width: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}
