import React, { useState, useEffect } from 'react';
import PlasmicSkeleton from '../components/PlasmicSkeleton';

export default function TestSkeleton() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        title: "Sample Content",
        description: "This is a sample description that was loaded after the skeleton animation.",
        items: [
          { id: 1, name: "Item 1", value: "Value 1" },
          { id: 2, name: "Item 2", value: "Value 2" },
          { id: 3, name: "Item 3", value: "Value 3" }
        ]
      });
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Skeleton Component Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Basic Skeleton</h2>
        <PlasmicSkeleton count={3} height="1.5rem" width="100%" />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Card Pattern</h2>
        <PlasmicSkeleton pattern="card" />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Table Pattern</h2>
        <PlasmicSkeleton pattern="table" tableRows={4} tableColumns={3} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>List Pattern</h2>
        <PlasmicSkeleton pattern="list" listItems={3} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Avatar Pattern</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <PlasmicSkeleton pattern="avatar" avatarSize="60px" />
          <PlasmicSkeleton pattern="avatar" avatarSize="40px" />
          <PlasmicSkeleton pattern="avatar" avatarSize="80px" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Custom Colors</h2>
        <PlasmicSkeleton 
          count={2} 
          height="1.5rem" 
          baseColor="#ff6b6b" 
          highlightColor="#ff8e8e"
          duration={2}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Conditional Rendering (Loading State)</h2>
        {loading ? (
          <PlasmicSkeleton pattern="text" textLines={4} />
        ) : (
          <div>
            <h3>{data.title}</h3>
            <p>{data.description}</p>
            <ul>
              {data.items.map(item => (
                <li key={item.id}>{item.name}: {item.value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Circular Skeleton</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <PlasmicSkeleton circle={true} height="50px" width="50px" />
          <PlasmicSkeleton circle={true} height="30px" width="30px" />
          <PlasmicSkeleton circle={true} height="70px" width="70px" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Different Animation Speeds</h2>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <p>Slow (3s)</p>
            <PlasmicSkeleton count={2} duration={3} />
          </div>
          <div>
            <p>Normal (1.5s)</p>
            <PlasmicSkeleton count={2} duration={1.5} />
          </div>
          <div>
            <p>Fast (0.5s)</p>
            <PlasmicSkeleton count={2} duration={0.5} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>RTL Direction</h2>
        <PlasmicSkeleton count={3} direction="rtl" />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>No Animation</h2>
        <PlasmicSkeleton count={3} enableAnimation={false} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Custom Highlight Background</h2>
        <PlasmicSkeleton 
          count={2} 
          customHighlightBackground="linear-gradient(90deg, #ff6b6b 40%, #4ecdc4 50%, #45b7d1 60%)"
        />
      </div>
    </div>
  );
}
