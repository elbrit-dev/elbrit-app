import React from 'react';
import PlasmicGraphQLHelper from './PlasmicGraphQLHelper';
import QueryDataTable from './QueryDataTable';

/**
 * QueryDataTableDemo Component
 * 
 * This component demonstrates how to use the QueryDataTable with GraphQL data.
 * It shows how to connect GraphQL queries to the data table component.
 */
export default function QueryDataTableDemo({
  // GraphQL configuration
  query = "",
  variables = {},
  endpoint = "",
  
  // Table configuration
  columns = [],
  dataPath = "",
  
  // Demo data for testing
  useDemoData = false,
  demoData = [],
  
  // Other props passed to QueryDataTable
  ...tableProps
}) {
  // Sample GraphQL query for users
  const sampleQuery = `
    query GetUsers($limit: Int, $offset: Int) {
      users(limit: $limit, offset: $offset) {
        items {
          id
          name
          email
          status
          createdAt
          role
        }
        total
        hasMore
      }
    }
  `;

  // Sample columns configuration
  const sampleColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 'bold' }}>#{value}</span>
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: '500' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.role}</div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => <a href={`mailto:${value}`} style={{ color: '#3b82f6' }}>{value}</a>
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: value === 'active' ? '#dcfce7' : '#fef2f2',
          color: value === 'active' ? '#166534' : '#dc2626'
        }}>
          {value}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // Sample demo data
  const sampleDemoData = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      status: "active",
      createdAt: "2024-01-15T10:30:00Z",
      role: "Admin"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "active",
      createdAt: "2024-01-16T14:20:00Z",
      role: "User"
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      status: "inactive",
      createdAt: "2024-01-17T09:15:00Z",
      role: "User"
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice.brown@example.com",
      status: "active",
      createdAt: "2024-01-18T16:45:00Z",
      role: "Manager"
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      status: "active",
      createdAt: "2024-01-19T11:30:00Z",
      role: "User"
    }
  ];

  // Use provided props or fall back to samples
  const finalQuery = query || sampleQuery;
  const finalVariables = variables || { limit: 10, offset: 0 };
  const finalEndpoint = endpoint || "/api/graphql";
  const finalColumns = columns.length > 0 ? columns : sampleColumns;
  const finalDataPath = dataPath || "users.items";
  const finalDemoData = demoData.length > 0 ? demoData : sampleDemoData;

  // If using demo data, render the table directly
  if (useDemoData) {
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>Query Data Table Demo (Sample Data)</h3>
        <QueryDataTable
          data={finalDemoData}
          columns={finalColumns}
          {...tableProps}
        />
      </div>
    );
  }

  // Otherwise, use GraphQL helper
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#374151' }}>Query Data Table Demo (GraphQL)</h3>
      <PlasmicGraphQLHelper
        query={finalQuery}
        variables={finalVariables}
        endpoint={finalEndpoint}
        loadingComponent={
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            background: '#f9fafb', 
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <div style={{ 
              display: 'inline-block',
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderRadius: '50%',
              borderTopColor: '#3b82f6',
              animation: 'spin 1s ease-in-out infinite'
            }}></div>
            <div style={{ marginTop: '10px' }}>Loading data...</div>
          </div>
        }
        errorComponent={
          <div style={{ 
            padding: '20px', 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            color: '#dc2626',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '500' }}>Error loading data</div>
          </div>
        }
      >
        {({ data, loading, error }) => (
          <QueryDataTable
            data={data}
            dataPath={finalDataPath}
            columns={finalColumns}
            loading={loading}
            error={error}
            onRowClick={(item) => {
              console.log('Row clicked:', item);
              // You can add custom row click handling here
            }}
            onSort={(sortConfig) => {
              console.log('Sort changed:', sortConfig);
              // You can add custom sort handling here
            }}
            onSearch={(searchTerm) => {
              console.log('Search term:', searchTerm);
              // You can add custom search handling here
            }}
            onSelectionChange={(selectedRows) => {
              console.log('Selected rows:', selectedRows);
              // You can add custom selection handling here
            }}
            {...tableProps}
          />
        )}
      </PlasmicGraphQLHelper>
    </div>
  );
}

// Export individual demo components for different use cases
export function SimpleDataTableDemo() {
  return (
    <QueryDataTableDemo
      useDemoData={true}
      showSearch={true}
      showPagination={true}
      itemsPerPage={5}
      striped={true}
      hoverable={true}
    />
  );
}

export function GraphQLDataTableDemo() {
  return (
    <QueryDataTableDemo
      useDemoData={false}
      showSearch={true}
      showPagination={true}
      itemsPerPage={10}
      selectable={true}
      bordered={true}
    />
  );
}

export function CompactDataTableDemo() {
  return (
    <QueryDataTableDemo
      useDemoData={true}
      compact={true}
      showSearch={false}
      showPagination={false}
      hoverable={false}
      striped={false}
    />
  );
} 