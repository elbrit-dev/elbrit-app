import React, { useState } from 'react';
import AdvancedTable from '../components/AdvancedTable';
import PrimeReactAdvancedTable from '../components/PrimeReactAdvancedTable';

const TestTables = () => {
  const [testData] = useState([
    { 
      id: 1, 
      name: "Test User 1", 
      email: "test1@example.com", 
      role: "User", 
      status: "Active",
      department: "Engineering",
      salary: 50000,
      createdAt: "2024-01-15"
    },
    { 
      id: 2, 
      name: "Test User 2", 
      email: "test2@example.com", 
      role: "Admin", 
      status: "Active",
      department: "Marketing",
      salary: 60000,
      createdAt: "2024-01-10"
    }
  ]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px', color: '#111827' }}>
        Table Components Test
      </h1>
      
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px', color: '#374151' }}>
          Custom AdvancedTable
        </h2>
        <AdvancedTable
          data={testData}
          loading={false}
          enableSearch={true}
          enableSorting={true}
          enablePagination={true}
          pageSize={10}
          tableHeight="300px"
        />
      </div>
      
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px', color: '#374151' }}>
          PrimeReact AdvancedTable
        </h2>
        <PrimeReactAdvancedTable
          data={testData}
          loading={false}
          enableSearch={true}
          enableSorting={true}
          enablePagination={true}
          pageSize={10}
          tableHeight="300px"
          showTitle={false}
          showToolbar={false}
          showStatusBar={false}
        />
      </div>
      
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px',
        color: '#0c4a6e'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>✅ Test Successful!</h3>
        <p style={{ margin: 0 }}>
          If you can see this page without any React errors, both table components are working correctly.
        </p>
      </div>
    </div>
  );
};

export default TestTables; 