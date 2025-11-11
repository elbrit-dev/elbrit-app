// Example usage of MaterialDataTable with Sales Team data
import React from 'react';
import MaterialDataTable from './MaterialDataTable';

export const SalesTeamExample = ({ data }) => {
  // Define columns for the main sales team table
  const columns = [
    {
      key: 'SalesTeam',
      title: 'Sales Team',
      sortable: true,
      filterable: true,
    },
    {
      key: 'Target',
      title: 'Target',
      sortable: true,
      align: 'right',
      render: (value) => value ? value.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }) : '0.00',
    },
    {
      key: 'GrossSales',
      title: 'Gross Sales',
      sortable: true,
      align: 'right',
      render: (value) => value ? value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2 
      }) : '$0.00',
    },
    {
      key: 'NetSales',
      title: 'Net Sales',
      sortable: true,
      align: 'right',
      render: (value) => value ? value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2 
      }) : '$0.00',
    },
    {
      key: 'CreditNotes',
      title: 'Credit Notes',
      sortable: true,
      align: 'right',
      render: (value) => value ? value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2 
      }) : '$0.00',
    },
    {
      key: 'SalesReturn',
      title: 'Sales Return',
      sortable: true,
      align: 'right',
      render: (value) => {
        const formatted = value ? value.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2 
        }) : '$0.00';
        const color = value < 0 ? 'red' : 'inherit';
        return <span style={{ color, fontWeight: value < 0 ? 600 : 400 }}>{formatted}</span>;
      },
    },
    {
      key: 'ProdOffer',
      title: 'Product Offer',
      sortable: true,
      align: 'right',
      render: (value) => value ? value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2 
      }) : '$0.00',
    },
    {
      key: 'IncentiveValue',
      title: 'Incentive Value',
      sortable: true,
      align: 'right',
      render: (value) => {
        const formatted = value ? value.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2 
        }) : '$0.00';
        return <span style={{ fontWeight: 700, color: '#2e7d32' }}>{formatted}</span>;
      },
    },
  ];

  return (
    <MaterialDataTable
      data={data}
      columns={columns}
      expandable
      nestedKey="HQs"
      expandIconPosition="inline"  // ← Icon appears inline with Sales Team name
      title="Sales Team Performance"
      showFilters
      pagination
      exportFilename="sales-team-performance.csv"
      onRowClick={(row) => console.log('Selected Sales Team:', row)}
    />
  );
};

// Example with the actual data structure you provided
export const SalesTeamWithActualData = () => {
  const sampleData = [
    {
      SalesTeam: "Elbrit Coimbatore",
      Target: 0,
      GrossSales: 840517.74,
      NetSales: 836417.54,
      CreditNotes: 4100.2,
      SalesReturn: -4100.2,
      ExpiryReturn: 0,
      Breakage: 0,
      Claim: 0,
      ProdOffer: 10949.34,
      PriceOffer: 0,
      RateDifference: 0,
      IncentiveValue: 836417.54,
      HQs: [
        {
          HQ: "HQ-Coimbatore",
          HQType: "HQ",
          GrossSales: 216859.02,
          NetSales: 216859.02,
          CreditNotes: 0,
          SalesReturn: 0,
          ExpiryReturn: 0,
          Breakage: 0,
          Claim: 0,
          ProdOffer: 0,
          PriceOffer: 0,
          RateDifference: 0,
          IncentiveValue: 0,
          TotalCustomers: 7,
        },
        {
          HQ: "HQ-Erode",
          HQType: "HQ",
          GrossSales: 468383.3,
          NetSales: 468383.3,
          CreditNotes: 0,
          SalesReturn: 0,
          ExpiryReturn: 0,
          Breakage: 0,
          Claim: 0,
          ProdOffer: 4064.43,
          PriceOffer: 0,
          RateDifference: 0,
          IncentiveValue: 0,
          TotalCustomers: 7,
        },
      ],
    },
    {
      SalesTeam: "CND Coimbatore",
      Target: 0,
      GrossSales: 762754.14,
      NetSales: 751832.64,
      CreditNotes: 10921.5,
      SalesReturn: -10921.5,
      ExpiryReturn: 0,
      Breakage: 0,
      Claim: 0,
      ProdOffer: 2275.8,
      PriceOffer: 0,
      RateDifference: 0,
      IncentiveValue: 751832.64,
      HQs: [
        // ... HQ data
      ],
    },
  ];

  return <SalesTeamExample data={sampleData} />;
};

// Simplified version - let auto-columns do the work
export const SalesTeamAutoColumns = ({ data }) => {
  return (
    <MaterialDataTable
      data={data}
      expandable
      nestedKey="HQs"
      expandIconPosition="inline"  // ← Clean inline expand icon
      title="Sales Team Performance"
      showFilters
      pagination
      dense={false}
      rowsPerPage={10}
    />
  );
};

// Comparison: Left vs Inline expand icon
export const ExpandIconComparison = ({ data }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Inline Expand Icon (Recommended)</h3>
        <MaterialDataTable
          data={data}
          expandable
          nestedKey="HQs"
          expandIconPosition="inline"  // ← Icon appears next to team name
          title="Sales Teams - Inline Icon"
          showFilters={false}
          pagination={false}
          rowsPerPage={5}
        />
      </div>
      
      <div>
        <h3>Left Expand Icon (Traditional)</h3>
        <MaterialDataTable
          data={data}
          expandable
          nestedKey="HQs"
          expandIconPosition="left"  // ← Separate column for icon
          title="Sales Teams - Left Icon"
          showFilters={false}
          pagination={false}
          rowsPerPage={5}
        />
      </div>
    </div>
  );
};

// With row selection for bulk actions
export const SalesTeamWithSelection = ({ data }) => {
  const [selectedTeams, setSelectedTeams] = React.useState([]);

  const handleSelectionChange = (teams) => {
    setSelectedTeams(teams);
    console.log('Selected teams:', teams);
  };

  return (
    <div>
      <MaterialDataTable
        data={data}
        expandable
        nestedKey="HQs"
        selectable
        onSelectionChange={handleSelectionChange}
        title={`Sales Teams (${selectedTeams.length} selected)`}
        showFilters
        pagination
      />
      
      {selectedTeams.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '0.5rem',
          border: '1px solid #2196f3'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
            Selected Teams Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Total Gross Sales:</strong> $
              {selectedTeams.reduce((sum, team) => sum + team.GrossSales, 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div>
              <strong>Total Net Sales:</strong> $
              {selectedTeams.reduce((sum, team) => sum + team.NetSales, 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div>
              <strong>Total Incentive:</strong> $
              {selectedTeams.reduce((sum, team) => sum + team.IncentiveValue, 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTeamExample;

