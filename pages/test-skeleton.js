import React, { useState } from 'react';
import PlasmicSkeleton from '../components/PlasmicSkeleton';

export default function TestSkeletonPage() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>PlasmicSkeleton Component Test</h1>
      <p>This page tests all the skeleton patterns to ensure they work correctly.</p>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3>Test Controls</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button 
            onClick={toggleSkeleton}
            style={{
              padding: '8px 16px',
              background: showSkeleton ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showSkeleton ? 'Hide showWhen' : 'Show showWhen'}
          </button>
          <button 
            onClick={toggleVisibility}
            style={{
              padding: '8px 16px',
              background: isVisible ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isVisible ? 'Hide isVisible' : 'Show isVisible'}
          </button>
          <button 
            onClick={simulateLoading}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Simulate Loading
          </button>
        </div>
        <p><strong>showWhen prop:</strong> {showSkeleton ? 'true' : 'false'}</p>
        <p><strong>isVisible prop:</strong> {isVisible ? 'true' : 'false'}</p>
        <p><strong>loading state:</strong> {loading ? 'true' : 'false'}</p>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Boolean Props Test</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>showWhen prop only</h4>
            <PlasmicSkeleton 
              count={3} 
              height="1.5rem" 
              showWhen={showSkeleton}
              isVisible={true}
            />
            <p style={{ color: '#666', fontSize: '12px' }}>
              showWhen={showSkeleton ? 'true' : 'false'}, isVisible=true
            </p>
          </div>
          <div>
            <h4>isVisible prop only</h4>
            <PlasmicSkeleton 
              count={3} 
              height="1.5rem" 
              showWhen={true}
              isVisible={isVisible}
            />
            <p style={{ color: '#666', fontSize: '12px' }}>
              showWhen=true, isVisible={isVisible ? 'true' : 'false'}
            </p>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4>Both props (both must be true)</h4>
          <PlasmicSkeleton 
            count={3} 
            height="1.5rem" 
            showWhen={showSkeleton}
            isVisible={isVisible}
          />
          <p style={{ color: '#666', fontSize: '12px' }}>
            showWhen={showSkeleton ? 'true' : 'false'}, isVisible={isVisible ? 'true' : 'false'}
          </p>
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Loading Simulation</h2>
        {loading ? (
          <PlasmicSkeleton 
            pattern="table" 
            tableRows={3} 
            tableColumns={4}
            height="2rem"
            showWhen={true}
          />
        ) : (
          <div style={{ 
            padding: '20px', 
            background: '#e8f5e8', 
            borderRadius: '4px',
            border: '1px solid #4caf50'
          }}>
            <h4>Data Loaded Successfully!</h4>
            <p>This content appears when loading is false</p>
          </div>
        )}
        <p style={{ color: '#666', fontSize: '14px' }}>
          This shows conditional rendering: {loading ? 'Skeleton (loading=true)' : 'Content (loading=false)'}
        </p>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Text Pattern</h2>
        <PlasmicSkeleton 
          pattern="text" 
          textLines={4} 
          height="1.2rem"
          baseColor="#e3f2fd"
          highlightColor="#bbdefb"
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Card Pattern</h2>
        <PlasmicSkeleton 
          pattern="card" 
          cardHeight="200px"
          avatarSize="60px"
          baseColor="#f3e5f5"
          highlightColor="#e1bee7"
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Avatar Pattern</h2>
        <PlasmicSkeleton 
          pattern="avatar" 
          avatarSize="80px"
          baseColor="#fff3e0"
          highlightColor="#ffcc02"
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Table Pattern</h2>
        <PlasmicSkeleton 
          pattern="table" 
          tableRows={5}
          tableColumns={4}
          height="2rem"
          baseColor="#e8f5e8"
          highlightColor="#c8e6c9"
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>List Pattern</h2>
        <PlasmicSkeleton 
          pattern="list" 
          listItems={4}
          avatarSize="50px"
          baseColor="#fce4ec"
          highlightColor="#f8bbd9"
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Custom Styling</h2>
        <PlasmicSkeleton 
          pattern="text"
          textLines={3}
          height="1.5rem"
          baseColor="#ff6b6b"
          highlightColor="#ff8e8e"
          duration={2}
          borderRadius="8px"
        />
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '40px'
      }}>
        <h3>How to Use in Plasmic Studio:</h3>
        <ol>
          <li>Search for "Advanced Skeleton" in the component panel</li>
          <li>Drag it onto your canvas</li>
          <li>Configure the pattern and styling in the properties panel</li>
          <li>Set up conditional rendering to show when loading</li>
        </ol>
      </div>
    </div>
  );
}
