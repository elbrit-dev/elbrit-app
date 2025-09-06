import React, { useState, useEffect } from 'react';
import PlasmicSkeleton from '../components/PlasmicSkeleton';

/**
 * Example showing how to use PlasmicSkeleton with GraphQL data loading
 * This demonstrates the pattern for Plasmic Studio with GraphQL queries
 */
const GraphQLSkeletonExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate GraphQL query loading
  useEffect(() => {
    const simulateGraphQLQuery = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate GraphQL query delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mock GraphQL response
        const mockResponse = {
          data: {
            users: {
              edges: [
                {
                  node: {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'Admin',
                    avatar: 'https://via.placeholder.com/40',
                    createdAt: '2024-01-15T10:30:00Z'
                  }
                },
                {
                  node: {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'User',
                    avatar: 'https://via.placeholder.com/40',
                    createdAt: '2024-01-16T14:20:00Z'
                  }
                },
                {
                  node: {
                    id: '3',
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    role: 'Moderator',
                    avatar: 'https://via.placeholder.com/40',
                    createdAt: '2024-01-17T09:15:00Z'
                  }
                },
                {
                  node: {
                    id: '4',
                    name: 'Alice Brown',
                    email: 'alice@example.com',
                    role: 'User',
                    avatar: 'https://via.placeholder.com/40',
                    createdAt: '2024-01-18T16:45:00Z'
                  }
                },
                {
                  node: {
                    id: '5',
                    name: 'Charlie Wilson',
                    email: 'charlie@example.com',
                    role: 'Admin',
                    avatar: 'https://via.placeholder.com/40',
                    createdAt: '2024-01-19T11:30:00Z'
                  }
                }
              ],
              pageInfo: {
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor1',
                endCursor: 'cursor5'
              }
            }
          }
        };
        
        setData(mockResponse.data);
      } catch (err) {
        setError('Failed to load data from GraphQL');
        console.error('GraphQL Error:', err);
      } finally {
        setLoading(false);
      }
    };

    simulateGraphQLQuery();
  }, []);

  // Handle retry
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Simulate retry
    setTimeout(() => {
      setData(null);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>GraphQL Skeleton Loading Example</h2>
      <p>This example shows how to use PlasmicSkeleton with GraphQL data loading in Plasmic Studio.</p>
      
      {/* Main Content Area with Conditional Rendering */}
      <div style={{ 
        background: '#fafafa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {loading ? (
          <div>
            <h3>Loading GraphQL Data...</h3>
            <p>Fetching users from the API...</p>
            
            {/* Table Skeleton for GraphQL data */}
            <PlasmicSkeleton 
              pattern="table"
              tableRows={5}
              tableColumns={5}
              height="2.5rem"
              baseColor="#e3f2fd"
              highlightColor="#bbdefb"
              duration={1.8}
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
            <h3>GraphQL Error</h3>
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Retry Query
            </button>
          </div>
        ) : data ? (
          <div>
            <h3>GraphQL Data Loaded Successfully!</h3>
            <div style={{ 
              background: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p><strong>Total Users:</strong> {data.users.edges.length}</p>
              <p><strong>Has Next Page:</strong> {data.users.pageInfo.hasNextPage ? 'Yes' : 'No'}</p>
              <p><strong>Query Status:</strong> Complete</p>
            </div>
            
            {/* Display GraphQL Data */}
            <div style={{ 
              display: 'grid', 
              gap: '15px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              {data.users.edges.map(({ node: user }) => (
                <div 
                  key={user.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        marginRight: '15px'
                      }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{user.name}</h4>
                      <p style={{ margin: '0', color: '#666' }}>{user.email}</p>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      background: user.role === 'Admin' ? '#ffebee' : '#e8f5e8',
                      color: user.role === 'Admin' ? '#c62828' : '#2e7d32',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {user.role}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Plasmic Studio Integration Guide */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>How to Implement in Plasmic Studio</h3>
        <ol>
          <li><strong>Add PlasmicSkeleton Component:</strong> Drag it from the component panel</li>
          <li><strong>Set Pattern:</strong> Choose "table" for data tables, "card" for cards, etc.</li>
          <li><strong>Configure Conditional Rendering:</strong> Show skeleton when loading = true</li>
          <li><strong>Add Your Content Component:</strong> Show when loading = false</li>
          <li><strong>Connect to GraphQL Query:</strong> Use the query's loading state</li>
        </ol>
      </div>

      {/* Code Examples */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <h4>Plasmic Studio Conditional Rendering Pattern:</h4>
        <pre style={{ 
          background: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>{`// In Plasmic Studio, set up conditional rendering:

// Condition 1: Show Skeleton
// Expression: loading === true
<PlasmicSkeleton 
  pattern="table"
  tableRows={5}
  tableColumns={5}
  height="2.5rem"
/>

// Condition 2: Show Content  
// Expression: loading === false && data !== null
<YourDataComponent data={data} />

// Condition 3: Show Error
// Expression: loading === false && error !== null
<ErrorComponent error={error} />`}</pre>
      </div>

      {/* Different Skeleton Patterns for Different Content Types */}
      <div style={{ marginTop: '30px' }}>
        <h3>Different Skeleton Patterns for GraphQL Data</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          {/* User List Pattern */}
          <div>
            <h4>User List (GraphQL Edges)</h4>
            <PlasmicSkeleton 
              pattern="list"
              listItems={4}
              avatarSize="45px"
              baseColor="#e1f5fe"
              highlightColor="#b3e5fc"
            />
          </div>
          
          {/* Card Grid Pattern */}
          <div>
            <h4>Card Grid (GraphQL Nodes)</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <PlasmicSkeleton 
                pattern="card"
                cardHeight="120px"
                avatarSize="40px"
                baseColor="#f3e5f5"
                highlightColor="#e1bee7"
              />
              <PlasmicSkeleton 
                pattern="card"
                cardHeight="120px"
                avatarSize="40px"
                baseColor="#f3e5f5"
                highlightColor="#e1bee7"
              />
            </div>
          </div>
          
          {/* Data Table Pattern */}
          <div>
            <h4>Data Table (GraphQL Results)</h4>
            <PlasmicSkeleton 
              pattern="table"
              tableRows={3}
              tableColumns={4}
              height="2rem"
              baseColor="#e8f5e8"
              highlightColor="#c8e6c9"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphQLSkeletonExample;
