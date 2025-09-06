import React, { useState, useEffect } from 'react';
import PlasmicSkeleton from '../components/PlasmicSkeleton';
import { useTableData } from '../hooks/useTableData';

/**
 * Example component showing how to use PlasmicSkeleton with data loading
 * This demonstrates the pattern you should use in Plasmic Studio
 */
const SkeletonLoadingExample = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock data
        const mockData = [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator' },
          { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
          { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin' },
        ];
        
        setData(mockData);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Use the table data hook
  const { finalTableData, finalColumns, isLoading } = useTableData({
    data,
    loading,
    error,
    columns: [
      { key: 'id', title: 'ID', type: 'number' },
      { key: 'name', title: 'Name', type: 'text' },
      { key: 'email', title: 'Email', type: 'text' },
      { key: 'role', title: 'Role', type: 'text' }
    ]
  });

  // Handle retry
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Trigger reload
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Skeleton Loading Example</h2>
      <p>This example shows how to use PlasmicSkeleton while data is loading.</p>
      
      {/* Conditional Rendering Pattern */}
      {loading || isLoading ? (
        <div>
          <h3>Loading Data...</h3>
          {/* Table Skeleton */}
          <PlasmicSkeleton 
            pattern="table"
            tableRows={5}
            tableColumns={4}
            height="2rem"
            baseColor="#f0f0f0"
            highlightColor="#e0e0e0"
            duration={1.5}
          />
        </div>
      ) : error ? (
        <div style={{ 
          padding: '20px', 
          background: '#ffebee', 
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#c62828'
        }}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          <h3>Data Loaded Successfully!</h3>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <p><strong>Records:</strong> {finalTableData.length}</p>
            <p><strong>Columns:</strong> {finalColumns.length}</p>
          </div>
          
          {/* Actual Data Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {finalColumns.map(col => (
                  <th 
                    key={col.key}
                    style={{ 
                      padding: '12px', 
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd'
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalTableData.map((row, index) => (
                <tr key={row.id || index}>
                  {finalColumns.map(col => (
                    <td 
                      key={col.key}
                      style={{ 
                        padding: '12px',
                        borderBottom: '1px solid #ddd'
                      }}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Examples */}
      <div style={{ marginTop: '40px' }}>
        <h3>Other Skeleton Patterns</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Card Pattern */}
          <div>
            <h4>Card Pattern</h4>
            <PlasmicSkeleton 
              pattern="card"
              cardHeight="150px"
              avatarSize="50px"
              baseColor="#e3f2fd"
              highlightColor="#bbdefb"
            />
          </div>
          
          {/* List Pattern */}
          <div>
            <h4>List Pattern</h4>
            <PlasmicSkeleton 
              pattern="list"
              listItems={3}
              avatarSize="40px"
              baseColor="#f3e5f5"
              highlightColor="#e1bee7"
            />
          </div>
          
          {/* Text Pattern */}
          <div>
            <h4>Text Pattern</h4>
            <PlasmicSkeleton 
              pattern="text"
              textLines={4}
              height="1.2rem"
              baseColor="#e8f5e8"
              highlightColor="#c8e6c9"
            />
          </div>
          
          {/* Avatar Pattern */}
          <div>
            <h4>Avatar Pattern</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlasmicSkeleton 
                pattern="avatar"
                avatarSize="60px"
                baseColor="#fff3e0"
                highlightColor="#ffcc02"
              />
              <div>
                <PlasmicSkeleton 
                  pattern="text"
                  textLines={2}
                  height="1rem"
                  width="120px"
                  baseColor="#fff3e0"
                  highlightColor="#ffcc02"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div style={{ 
        marginTop: '40px', 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <h4>Code Pattern for Plasmic Studio:</h4>
        <pre>{`// In your Plasmic component
{loading ? (
  <PlasmicSkeleton 
    pattern="table"
    tableRows={5}
    tableColumns={4}
    height="2rem"
  />
) : (
  <YourDataComponent data={data} />
)}`}</pre>
      </div>
    </div>
  );
};

export default SkeletonLoadingExample;
