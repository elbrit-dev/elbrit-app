import React from 'react';
import CustomDataTable from './CustomDataTable';

/**
 * Example usage of CustomDataTable
 * This demonstrates all features and configuration options
 */
const CustomDataTableExample = () => {
  // Sample data with nested items (like the sales team example from the images)
  const sampleData = [
    {
      id: 1,
      salesTeam: 'Elbit Rajasthan',
      brand: 'PREGABRIT',
      target: 2100000,
      month1: 2100000,
      month2: 2100000,
      month3: 2100000,
      items: [
        { id: 'detail-1-1', invoice: 'INV-001', amount: 500000, date: '2024-01-15', customer: 'ABC Hospital' },
        { id: 'detail-1-2', invoice: 'INV-002', amount: 600000, date: '2024-01-20', customer: 'XYZ Clinic' },
        { id: 'detail-1-3', invoice: 'INV-003', amount: 1000000, date: '2024-01-25', customer: 'Medical Center' }
      ]
    },
    {
      id: 2,
      salesTeam: 'DND Chennai',
      brand: 'VITARICH-D3',
      target: 2100000,
      month1: 2100000,
      month2: 2100000,
      month3: 2100000,
      items: [
        { id: 'detail-2-1', invoice: 'INV-004', amount: 700000, date: '2024-01-10', customer: 'City Hospital' },
        { id: 'detail-2-2', invoice: 'INV-005', amount: 1400000, date: '2024-01-18', customer: 'Health Clinic' }
      ]
    },
    {
      id: 3,
      salesTeam: 'Aura & Proxima',
      brand: 'PROXIMA-PLUS',
      target: 2100000,
      month1: 2100000,
      month2: 2100000,
      month3: 2100000,
      items: [
        { id: 'detail-3-1', invoice: 'INV-006', amount: 800000, date: '2024-01-12', customer: 'Metro Medical' },
        { id: 'detail-3-2', invoice: 'INV-007', amount: 900000, date: '2024-01-22', customer: 'Central Hospital' },
        { id: 'detail-3-3', invoice: 'INV-008', amount: 400000, date: '2024-01-28', customer: 'Care Clinic' }
      ]
    },
    {
      id: 4,
      salesTeam: 'Elbit Chennai',
      brand: 'ELBIT-500',
      target: 2100000,
      month1: 2100000,
      month2: 2100000,
      month3: 2100000,
      items: []
    },
    {
      id: 5,
      salesTeam: 'Elbit Bangalore',
      brand: 'NEURO-PLUS',
      target: 2100000,
      month1: 2100000,
      month2: 2100000,
      month3: 2100000,
      items: [
        { id: 'detail-5-1', invoice: 'INV-009', amount: 1200000, date: '2024-01-05', customer: 'Apollo Hospital' },
        { id: 'detail-5-2', invoice: 'INV-010', amount: 900000, date: '2024-01-15', customer: 'Fortis Clinic' }
      ]
    },
    {
      id: 6,
      salesTeam: 'DND Coimbatore',
      brand: 'CALCIUM-MAX',
      target: 2100000,
      month1: 2100000,
      month2: 2100000,
      month3: 2100000,
      items: [
        { id: 'detail-6-1', invoice: 'INV-011', amount: 650000, date: '2024-01-08', customer: 'Wellness Center' }
      ]
    }
  ];

  // Column definitions
  const columns = [
    {
      key: 'salesTeam',
      title: 'Sales Team',
      sortable: true,
      filterable: true,
      align: 'left',
      wrap: false
    },
    {
      key: 'brand',
      title: 'Brand',
      sortable: true,
      filterable: true,
      align: 'left',
      wrap: false
    },
    {
      key: 'target',
      title: 'Target',
      sortable: true,
      filterable: true,
      align: 'right',
      type: 'currency',
      currency: 'USD',
      formatter: (value) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      }
    },
    {
      key: 'month1',
      title: 'January',
      sortable: true,
      filterable: true,
      align: 'right',
      formatter: (value) => value.toLocaleString()
    },
    {
      key: 'month2',
      title: 'February',
      sortable: true,
      filterable: true,
      align: 'right',
      formatter: (value) => value.toLocaleString()
    },
    {
      key: 'month3',
      title: 'March',
      sortable: true,
      filterable: true,
      align: 'right',
      formatter: (value) => value.toLocaleString()
    }
  ];

  // Nested columns (for expanded rows)
  const nestedColumns = [
    {
      key: 'invoice',
      title: 'Invoice No',
      sortable: false,
      align: 'left'
    },
    {
      key: 'customer',
      title: 'Customer',
      sortable: false,
      align: 'left'
    },
    {
      key: 'date',
      title: 'Date',
      sortable: false,
      align: 'left'
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: false,
      align: 'right',
      formatter: (value) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      }
    }
  ];

  // Custom export handler
  const handleExport = (data) => {
    console.log('Exporting data:', data);
    // You can implement custom export logic here
    // Default CSV export will be used if this is not provided
  };

  // Row click handler
  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '100%' }}>
      <h1 style={{ 
        fontSize: '1.875rem', 
        fontWeight: '700', 
        marginBottom: '1.5rem',
        color: '#1e293b'
      }}>
        Custom Data Table - Sales Team Performance
      </h1>
      
      <p style={{
        fontSize: '0.875rem',
        color: '#64748b',
        marginBottom: '2rem',
        lineHeight: '1.5'
      }}>
        This custom data table features:<br/>
        • <strong>Expand/Collapse</strong> rows to view detailed invoice information<br/>
        • <strong>Global Search</strong> across all columns<br/>
        • <strong>Column Filters</strong> in dedicated row for precise filtering<br/>
        • <strong>Sorting</strong> by clicking column headers<br/>
        • <strong>Export</strong> functionality to download data as CSV<br/>
        • <strong>Fully Responsive</strong> design using rem/em units<br/>
      </p>

      <CustomDataTable
        data={sampleData}
        columns={columns}
        rowKey="id"
        nestedKey="items"
        enableExpansion={true}
        enableSearch={true}
        enableExport={true}
        enableFilters={true}
        enableSorting={true}
        onRowClick={handleRowClick}
        onExport={handleExport}
        tableHeight="70vh"
        customStyles={{
          container: {
            // Custom container styles
          },
          toolbar: {
            // Custom toolbar styles
          },
          table: {
            // Custom table styles
          },
          thead: {
            // Custom thead styles
          },
          th: {
            // Custom th styles
          },
          tr: {
            // Custom tr styles
          },
          td: {
            // Custom td styles
          }
        }}
      />

      {/* Additional Examples Section */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#1e293b'
        }}>
          Usage Examples
        </h2>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          overflowX: 'auto'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`// Basic Usage
<CustomDataTable
  data={myData}
  columns={myColumns}
  rowKey="id"
  nestedKey="items"
/>

// With Custom Styles
<CustomDataTable
  data={myData}
  columns={myColumns}
  customStyles={{
    container: { maxWidth: '1400px' },
    toolbar: { backgroundColor: '#eff6ff' },
    table: { fontSize: '1rem' }
  }}
/>

// Disable Features
<CustomDataTable
  data={myData}
  columns={myColumns}
  enableExpansion={false}
  enableFilters={false}
  enableSorting={false}
/>

// Custom Export Handler
<CustomDataTable
  data={myData}
  columns={myColumns}
  onExport={(data) => {
    // Custom export logic
    console.log('Export:', data);
  }}
/>`}
          </pre>
        </div>
      </div>

      {/* Column Configuration Guide */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#1e293b'
        }}>
          Column Configuration
        </h2>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          overflowX: 'auto'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`const columns = [
  {
    key: 'fieldName',           // Data field key
    title: 'Display Name',      // Column header
    sortable: true,             // Enable sorting
    filterable: true,           // Enable filtering
    align: 'left',              // 'left', 'center', 'right'
    wrap: false,                // Text wrapping
    type: 'currency',           // 'currency', 'date', etc.
    currency: 'USD',            // For currency type
    decimals: 2,                // Decimal places for numbers
    formatter: (value) => {},   // Custom formatter function
    render: (value, row) => {}  // Custom render function
  }
];`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CustomDataTableExample;

